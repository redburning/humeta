package redburning.github.io.humeta.service;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import redburning.github.io.humeta.dto.ChemicalDescriptionDto;
import redburning.github.io.humeta.dto.MetaboliteCountDto;
import redburning.github.io.humeta.dto.MetaboliteDetailDto;
import redburning.github.io.humeta.dto.MetaboliteDto;
import redburning.github.io.humeta.dto.MetabolitePageDto;
import redburning.github.io.humeta.dto.MetaboliteOverviewDto;
import redburning.github.io.humeta.dto.MetaboliteQuery;
import redburning.github.io.humeta.dto.MetaboliteSearchRequest;
import redburning.github.io.humeta.dto.PropertyFieldDto;
import redburning.github.io.humeta.dto.SuggestionDto;
import redburning.github.io.humeta.dto.TaxonomyDto;
import redburning.github.io.humeta.dto.TaxonomyNodeDto;
import redburning.github.io.humeta.entity.MetaboliteDescEntity;
import redburning.github.io.humeta.entity.MetaboliteEntity;
import redburning.github.io.humeta.repository.MetaboliteDescRepository;
import redburning.github.io.humeta.repository.MetaboliteRepository;
import redburning.github.io.humeta.repository.MetaboliteSpecifications;

/**
 * 代谢物检索与搜索框联想。
 */
@Service
public class MetaboliteService {

    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 2000;
    private static final int DEFAULT_SUGGESTION_LIMIT = 8;
    private static final int MAX_SUGGESTION_LIMIT = 20;
    private static final int MAX_SUGGESTION_ROWS = 400;

    private static final Set<String> IDENTIFIER_FIELDS = new HashSet<>(Arrays.asList(
            "hmdb", "kegg", "chebi", "formula", "inchikey"));

    private static final Sort SORT_BY_ID = Sort.by(Sort.Direction.ASC, "id");

    private final MetaboliteRepository metaboliteRepository;
    private final MetaboliteDescRepository metaboliteDescRepository;

    public MetaboliteService(MetaboliteRepository metaboliteRepository,
            MetaboliteDescRepository metaboliteDescRepository) {
        this.metaboliteRepository = metaboliteRepository;
        this.metaboliteDescRepository = metaboliteDescRepository;
    }

    /**
     * 按查询条件分页检索；没有条件时返回浏览列表。
     */
    public MetabolitePageDto search(MetaboliteSearchRequest request) {
        List<MetaboliteQuery> queries = new ArrayList<>();
        Integer requestedPage = null;
        Integer requestedSize = null;

        if (request != null) {
            requestedPage = request.getPage();
            requestedSize = request.getSize();
            if (request.getQueries() != null) {
                for (MetaboliteQuery query : request.getQueries()) {
                    if (query != null && query.getKeyword() != null
                            && !query.getKeyword().trim().isEmpty()) {
                        queries.add(query);
                    }
                }
            }
        }

        int page = requestedPage == null || requestedPage <= 0 ? 1 : requestedPage;
        int size = clamp(requestedSize, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(page - 1, size, SORT_BY_ID);
        Specification<MetaboliteEntity> specification = MetaboliteSpecifications.byQueries(queries);
        Page<MetaboliteEntity> result = specification == null
                ? metaboliteRepository.findAll(pageable)
                : metaboliteRepository.findAll(specification, pageable);

        List<MetaboliteDto> items = result.getContent().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return new MetabolitePageDto(items, result.getTotalElements(), page, size, result.getTotalPages());
    }

    /**
     * @return {@code metabolite} 表的总记录数
     */
    public MetaboliteCountDto count() {
        return new MetaboliteCountDto(metaboliteRepository.count());
    }

    /**
     * 搜索框联想，规则与前端 mock 版本保持一致：
     * 精确匹配 &gt; 前缀匹配 &gt; 包含匹配，名称类优先于编号类。
     */
    public List<SuggestionDto> suggest(String keyword, Integer limit) {
        String originalKeyword = keyword == null ? "" : keyword.trim();
        String normalizedKeyword = normalize(originalKeyword);
        if (normalizedKeyword.isEmpty()) {
            return Collections.emptyList();
        }

        int max = clamp(limit, DEFAULT_SUGGESTION_LIMIT, MAX_SUGGESTION_LIMIT);
        int rowLimit = Math.min(MAX_SUGGESTION_ROWS, Math.max(40, max * 20));
        List<MetaboliteEntity> rows = metaboliteRepository.findAll(
                MetaboliteSpecifications.byKeyword(originalKeyword),
                PageRequest.of(0, rowLimit, SORT_BY_ID)).getContent();

        List<RankedSuggestion> ranked = new ArrayList<>();
        int recordIndex = 0;

        for (MetaboliteEntity entity : rows) {
            List<RankedSuggestion> recordMatches = new ArrayList<>();

            for (SuggestionCandidate candidate : createCandidates(entity)) {
                String normalizedLabel = normalize(candidate.label);
                if (normalizedLabel.isEmpty() || !normalizedLabel.contains(normalizedKeyword)) {
                    continue;
                }
                recordMatches.add(rank(candidate, normalizedKeyword, recordIndex * 100 + candidate.order));
            }

            if (recordMatches.isEmpty()) {
                recordIndex++;
                continue;
            }

            ranked.addAll(recordMatches);

            boolean hasMetaboliteMatch = false;
            boolean hasPrimaryIdentifier = false;
            for (RankedSuggestion match : recordMatches) {
                if ("Metabolite".equals(match.category)) {
                    hasMetaboliteMatch = true;
                }
                if ("id".equals(match.field) && entity.getId().equals(match.label)) {
                    hasPrimaryIdentifier = true;
                }
            }

            if (hasMetaboliteMatch && !hasPrimaryIdentifier) {
                RankedSuggestion best = recordMatches.get(0);
                for (RankedSuggestion match : recordMatches) {
                    if (compare(match, best) < 0) {
                        best = match;
                    }
                }
                ranked.add(contextSuggestion(entity.getId(), best, recordIndex * 100 + 99));
            }

            recordIndex++;
        }

        ranked.sort(MetaboliteService::compare);

        Set<String> seen = new HashSet<>();
        List<SuggestionDto> suggestions = new ArrayList<>();
        for (RankedSuggestion item : ranked) {
            if (!seen.add(item.field + ":" + item.label)) {
                continue;
            }
            suggestions.add(item.toDto());
            if (suggestions.size() >= max) {
                break;
            }
        }
        return suggestions;
    }

    /**
     * 按 Humeta 编号查询详情，未找到时返回 {@code null}。
     */
    public MetaboliteDetailDto findDetailById(String id) {
        if (id == null || id.trim().isEmpty()) {
            return null;
        }
        return metaboliteRepository.findByIdIgnoreCase(id.trim())
                .map(entity -> toDetailDto(
                        entity,
                        metaboliteDescRepository.findById(entity.getId()).orElse(null)))
                .orElse(null);
    }

    private MetaboliteDto toDto(MetaboliteEntity entity) {
        MetaboliteDto dto = new MetaboliteDto();
        dto.setId(entity.getId());
        dto.setMetaboliteId(entity.getId());

        List<String> alternateIds = new ArrayList<>();
        addIfPresent(alternateIds, entity.getLipidMaps());
        addIfPresent(alternateIds, entity.getSwissLipids());
        dto.setAlternateIds(alternateIds);

        String name = displayName(entity.getName());
        String chineseName = displayName(entity.getChineseName());
        dto.setName(name);
        dto.setChineseName(chineseName);
        dto.setSynonyms(buildSynonyms(entity, name, chineseName));

        dto.setHmdb(emptyIfNull(entity.getHmdb()));
        dto.setKegg(emptyIfNull(entity.getKegg()));
        dto.setChebi(emptyIfNull(entity.getChebi()));
        dto.setFormula(emptyIfNull(entity.getFormula()));
        dto.setInchikey(emptyIfNull(entity.getInchikey()));
        dto.setSmiles(emptyIfNull(entity.getSmiles()));
        dto.setCas(emptyIfNull(entity.getCas()));
        dto.setPubchem(emptyIfNull(entity.getPubchem()));
        dto.setLipidMaps(emptyIfNull(entity.getLipidMaps()));
        dto.setSwissLipids(emptyIfNull(entity.getSwissLipids()));
        dto.setKey(entity.getId());
        dto.setMonoisotopicMw(formatDecimal(entity.getMonoisotopicMass()));
        dto.setCategory(firstNonBlank(
                entity.getBiochemicalClass(), entity.getHumanMetabolismSuperclass()));
        dto.setStructureImage("/images/structures/" + entity.getId() + ".svg");
        return dto;
    }

    private MetaboliteDetailDto toDetailDto(MetaboliteEntity entity, MetaboliteDescEntity desc) {
        MetaboliteDetailDto dto = new MetaboliteDetailDto();
        dto.setId(entity.getId());
        dto.setName(displayName(entity.getName()));
        dto.setChineseName(displayName(entity.getChineseName()));
        dto.setIdentifiers(buildIdentifiers(entity));
        dto.setOverview(buildOverview(desc));
        dto.setChemicalDescription(buildChemicalDescription(entity, dto.getName()));
        dto.setTaxonomy(buildTaxonomy(entity));
        return dto;
    }

    private MetaboliteOverviewDto buildOverview(MetaboliteDescEntity desc) {
        if (desc == null) {
            return null;
        }

        List<String> description = new ArrayList<>();
        addIfPresent(description, desc.getDescCn());
        addIfPresent(description, desc.getDescEn());
        if (description.isEmpty()) {
            return null;
        }

        return new MetaboliteOverviewDto("Biochemical Origin:", "", description);
    }

    private List<PropertyFieldDto> buildIdentifiers(MetaboliteEntity entity) {
        List<PropertyFieldDto> fields = new ArrayList<>();
        fields.add(PropertyFieldDto.of("Humeta", entity.getId()));
        addIdentifier(fields, "Structural Hierarchy", entity.getStructuralHierarchy());
        addIdentifier(fields, "Primary biological locations", entity.getPrimaryBiologicalLocations());
        addIdentifier(fields, "Preferred detection mode", entity.getPreferredDetectionMode());
        addIdentifier(fields, "CAS Number", entity.getCas());
        addIdentifier(fields, "PubChem", entity.getPubchem());
        addIdentifier(fields, "HMDB", entity.getHmdb());
        addIdentifier(fields, "KEGG", entity.getKegg());
        addIdentifier(fields, "LIPID MAPS", entity.getLipidMaps());
        addIdentifier(fields, "SwissLipids", entity.getSwissLipids());
        addIdentifier(fields, "ChEBI", entity.getChebi());
        addIdentifier(fields, "Common Abbreviations", entity.getCommonAbbreviations());
        addIdentifier(fields, "HMDB name (2026V5)", entity.getHmdbName2026V5());
        addIdentifier(fields, "Metabolon name (2022NC)", entity.getMetabolonName2022NC());
        addWideIdentifier(fields, "Common Synonyms", entity.getCommonSynonyms());
        addWideIdentifier(fields, "Chinese Synonyms", entity.getChineseSynonyms());
        return fields;
    }

    private static void addIdentifier(List<PropertyFieldDto> fields, String label, String value) {
        if (!isBlank(value)) {
            fields.add(PropertyFieldDto.of(label, value.trim()));
        }
    }

    private static void addWideIdentifier(List<PropertyFieldDto> fields, String label, String value) {
        if (!isBlank(value)) {
            fields.add(PropertyFieldDto.wide(label, value.trim()));
        }
    }

    private ChemicalDescriptionDto buildChemicalDescription(MetaboliteEntity entity, String name) {
        ChemicalDescriptionDto description = new ChemicalDescriptionDto();
        List<List<PropertyFieldDto>> rows = new ArrayList<>();

        addRow(rows,
                field("Formula", entity.getFormula()),
                field("Charge State", formatInteger(entity.getChargeState())));
        addRow(rows,
                field("Monoisotopic Mass", formatDecimalValue(entity.getMonoisotopicMass())),
                field("Average Mass", formatDecimalValue(entity.getAverageMass())));
        addRow(rows, field("IUPAC Name", entity.getIupacName()));
        addRow(rows, field("InChI Key", entity.getInchikey()));
        addRow(rows, field("SMILES", entity.getSmiles()));
        addRow(rows, field("Universal SMILES", entity.getUniversalSmiles()));
        addRow(rows,
                field("ALogP", formatDecimalValue(entity.getAlogp())),
                field("Molecular Refractivity", formatDecimalValue(entity.getMolecularRefractivity())));
        addRow(rows,
                field("Num H-Bond Donors", formatInteger(entity.getNumHBondDonors())),
                field("Num H-Bond Acceptors", formatInteger(entity.getNumHBondAcceptors())));
        addRow(rows,
                field("Topological PSA", formatDecimalValue(entity.getTopologicalPsa())),
                field("Fraction Csp3", formatDecimalValue(entity.getFractionCsp3())));
        addRow(rows,
                field("Num Rotatable Bonds", formatInteger(entity.getNumRotatableBonds())),
                field("Num Aromatic Rings", formatInteger(entity.getNumAromaticRings())));
        addRow(rows,
                field("Number of Heavy Atoms", formatInteger(entity.getNumberOfHeavyAtoms())),
                field("Number of Rings", formatInteger(entity.getNumberOfRings())));
        addRow(rows,
                field("Num Chiral Centers", formatInteger(entity.getNumChiralCenters())),
                field("Num Aliphatic Rings", formatInteger(entity.getNumAliphaticRings())));
        addRow(rows,
                field("Violations of Lipinski's Rule", formatInteger(entity.getViolationsOfLipinskiRule())),
                field("Violations of Veber's Rules", formatInteger(entity.getViolationsOfVeberRule())));

        description.setRows(rows);
        description.setStructureImage("/images/structures/" + entity.getId() + ".svg");
        description.setStructureAlt((isBlank(name) ? entity.getId() : name) + " 2D chemical structure");
        description.setStructureDownloadName(entity.getId() + ".svg");
        return description;
    }

    private static PropertyFieldDto field(String label, String value) {
        return isBlank(value) ? null : PropertyFieldDto.of(label, value.trim());
    }

    private static void addRow(List<List<PropertyFieldDto>> rows, PropertyFieldDto... fields) {
        List<PropertyFieldDto> row = new ArrayList<>();
        for (PropertyFieldDto field : fields) {
            if (field != null) {
                row.add(field);
            }
        }
        if (!row.isEmpty()) {
            rows.add(row);
        }
    }

    private static String formatInteger(Integer value) {
        return value == null ? null : String.valueOf(value);
    }

    private static String formatDecimalValue(Double value) {
        return value == null ? null : BigDecimal.valueOf(value).stripTrailingZeros().toPlainString();
    }

    private List<TaxonomyDto> buildTaxonomy(MetaboliteEntity entity) {
        List<TaxonomyDto> trees = new ArrayList<>();

        TaxonomyNodeDto humetaTree = buildChain("humeta",
                Arrays.asList("Human Metabolism Superclass", "Biochemical Class", "Metabolic subpathway"),
                Arrays.asList(
                        entity.getHumanMetabolismSuperclass(),
                        entity.getBiochemicalClass(),
                        entity.getMetabolicSubpathway()));
        if (humetaTree != null) {
            trees.add(new TaxonomyDto("np-classifier", "Humeta Classification System", humetaTree));
        }

        TaxonomyNodeDto classifierTree = buildChain("classifier",
                Arrays.asList("Kingdom", "Superclass", "Class", "Subclass",
                        "Parent Level 1", "Parent Level 2", "Parent Level 3",
                        "Parent Level 4", "Parent Level 5", "Parent Level 6"),
                Arrays.asList(
                        entity.getKingdom(),
                        entity.getSuperclass(),
                        entity.getChemicalClass(),
                        entity.getSubclass(),
                        entity.getParentLevel1(),
                        entity.getParentLevel2(),
                        entity.getParentLevel3(),
                        entity.getParentLevel4(),
                        entity.getParentLevel5(),
                        entity.getParentLevel6()));
        if (classifierTree != null) {
            trees.add(new TaxonomyDto("classifier", "Classyfire System", classifierTree));
        }

        return trees;
    }

    private static TaxonomyNodeDto buildChain(String idPrefix, List<String> ranks, List<String> labels) {
        TaxonomyNodeDto root = null;
        TaxonomyNodeDto parent = null;

        for (int index = 0; index < ranks.size(); index++) {
            String label = index < labels.size() ? labels.get(index) : null;
            if (isBlank(label)) {
                break;
            }

            TaxonomyNodeDto node = new TaxonomyNodeDto(
                    idPrefix + "-" + index,
                    ranks.get(index),
                    label.trim(),
                    new ArrayList<>());
            if (root == null) {
                root = node;
            } else {
                parent.getChildren().add(node);
            }
            parent = node;
        }

        return root;
    }

    private static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private List<SuggestionCandidate> createCandidates(MetaboliteEntity entity) {
        List<SuggestionCandidate> candidates = new ArrayList<>();
        String primaryName = displayName(entity.getName());
        String primaryNameValue = normalize(primaryName);

        addCandidate(candidates, primaryName, primaryNameValue, "name", "Metabolite", CandidateKind.NAME);
        for (String segment : splitList(entity.getName())) {
            addCandidate(candidates, segment, primaryNameValue, "name", "Metabolite", CandidateKind.ALIAS);
        }

        addCandidate(candidates, displayName(entity.getChineseName()), primaryNameValue,
                "name", "Metabolite", CandidateKind.ALIAS);

        for (String synonym : splitList(entity.getCommonSynonyms())) {
            addCandidate(candidates, synonym, primaryNameValue, "name", "Metabolite", CandidateKind.ALIAS);
        }
        for (String synonym : splitList(entity.getChineseSynonyms())) {
            addCandidate(candidates, synonym, primaryNameValue, "name", "Metabolite", CandidateKind.ALIAS);
        }

        addCandidate(candidates, entity.getId(), entity.getId(), "id", "Identifier", CandidateKind.FIELD);
        addCandidate(candidates, entity.getLipidMaps(), entity.getLipidMaps(), "id", "Identifier", CandidateKind.FIELD);
        addCandidate(candidates, entity.getSwissLipids(), entity.getSwissLipids(), "id", "Identifier", CandidateKind.FIELD);
        addCandidate(candidates, entity.getHmdb(), entity.getHmdb(), "hmdb", "Identifier", CandidateKind.FIELD);
        addCandidate(candidates, entity.getKegg(), entity.getKegg(), "kegg", "Identifier", CandidateKind.FIELD);
        addCandidate(candidates, entity.getChebi(), entity.getChebi(), "chebi", "Identifier", CandidateKind.FIELD);
        addCandidate(candidates, entity.getFormula(), entity.getFormula(), "formula", "Formula", CandidateKind.FIELD);
        addCandidate(candidates, entity.getInchikey(), entity.getInchikey(), "inchikey", "Identifier", CandidateKind.FIELD);
        addCandidate(candidates, entity.getSmiles(), entity.getSmiles(), "smiles", "Structure", CandidateKind.FIELD);
        return candidates;
    }

    private void addCandidate(List<SuggestionCandidate> candidates, String label, String value,
            String field, String category, CandidateKind kind) {
        if (label == null) {
            return;
        }
        String trimmed = label.trim();
        if (trimmed.isEmpty()) {
            return;
        }
        candidates.add(new SuggestionCandidate(
                trimmed,
                value == null ? "" : value,
                field,
                category,
                kind,
                candidates.size()));
    }

    private RankedSuggestion rank(SuggestionCandidate candidate, String normalizedKeyword, int order) {
        String normalizedLabel = normalize(candidate.label);
        boolean exact = normalizedLabel.equals(normalizedKeyword);

        String matchType;
        int score;
        if (candidate.kind == CandidateKind.NAME) {
            matchType = exact ? "exact" : "fuzzy";
            score = exact ? 100 : 70;
        } else if (candidate.kind == CandidateKind.ALIAS) {
            matchType = exact ? "alias" : "fuzzy";
            score = exact ? 90 : 70;
        } else if (IDENTIFIER_FIELDS.contains(candidate.field)) {
            matchType = "identifier";
            score = 95;
        } else if ("smiles".equals(candidate.field)) {
            matchType = exact ? "exact" : "fuzzy";
            score = exact ? 100 : 70;
        } else {
            matchType = "exact";
            score = 100;
        }

        RankedSuggestion suggestion = new RankedSuggestion();
        suggestion.label = candidate.label;
        suggestion.value = candidate.value;
        suggestion.field = candidate.field;
        suggestion.category = candidate.category;
        suggestion.matchType = matchType;
        suggestion.score = score;
        suggestion.isPrefix = normalizedLabel.startsWith(normalizedKeyword);
        suggestion.order = order;
        return suggestion;
    }

    private RankedSuggestion contextSuggestion(String id, RankedSuggestion best, int order) {
        RankedSuggestion suggestion = new RankedSuggestion();
        suggestion.label = id;
        suggestion.value = id;
        suggestion.field = "id";
        suggestion.category = "Identifier";
        suggestion.matchType = best.matchType;
        suggestion.score = best.score;
        suggestion.isContext = true;
        suggestion.isPrefix = false;
        suggestion.order = order;
        return suggestion;
    }

    private static int compare(RankedSuggestion left, RankedSuggestion right) {
        if (left.isContext != right.isContext) {
            return left.isContext ? 1 : -1;
        }
        if (left.isPrefix != right.isPrefix) {
            return left.isPrefix ? -1 : 1;
        }
        if (left.score != right.score) {
            return Integer.compare(right.score, left.score);
        }
        return Integer.compare(left.order, right.order);
    }

    private List<String> buildSynonyms(MetaboliteEntity entity, String name, String chineseName) {
        List<String> synonyms = new ArrayList<>();
        Set<String> seen = new HashSet<>();

        addSynonym(seen, synonyms, name);
        addSynonym(seen, synonyms, chineseName);
        for (String synonym : splitList(entity.getCommonSynonyms())) {
            addSynonym(seen, synonyms, synonym);
        }
        for (String synonym : splitList(entity.getChineseSynonyms())) {
            addSynonym(seen, synonyms, synonym);
        }
        return synonyms;
    }

    private void addSynonym(Set<String> seen, List<String> synonyms, String value) {
        if (value == null) {
            return;
        }
        String trimmed = value.trim();
        if (trimmed.isEmpty() || !seen.add(normalize(trimmed))) {
            return;
        }
        synonyms.add(trimmed);
    }

    private static List<String> splitList(String value) {
        if (value == null || value.isEmpty()) {
            return Collections.emptyList();
        }
        List<String> parts = new ArrayList<>();
        for (String part : value.split("[;；]")) {
            String trimmed = part.trim();
            if (!trimmed.isEmpty()) {
                parts.add(trimmed);
            }
        }
        return parts;
    }

    private static String displayName(String value) {
        List<String> parts = splitList(value);
        if (parts.isEmpty()) {
            return emptyIfNull(value);
        }
        return parts.get(parts.size() - 1);
    }

    private static String normalize(String value) {
        return Normalizer.normalize(value, Normalizer.Form.NFKC).trim().toLowerCase(Locale.ROOT);
    }

    private static String formatDecimal(Double value) {
        if (value == null) {
            return "";
        }
        return BigDecimal.valueOf(value).stripTrailingZeros().toPlainString();
    }

    private static String emptyIfNull(String value) {
        return value == null ? "" : value.trim();
    }

    private static String firstNonBlank(String first, String second) {
        if (first != null && !first.trim().isEmpty()) {
            return first.trim();
        }
        return emptyIfNull(second);
    }

    private static void addIfPresent(List<String> values, String value) {
        if (value != null && !value.trim().isEmpty()) {
            values.add(value.trim());
        }
    }

    private static int clamp(Integer value, int defaultValue, int max) {
        if (value == null || value <= 0) {
            return defaultValue;
        }
        return Math.min(value, max);
    }

    private enum CandidateKind {
        NAME, ALIAS, FIELD
    }

    private static final class SuggestionCandidate {

        private final String label;
        private final String value;
        private final String field;
        private final String category;
        private final CandidateKind kind;
        private final int order;

        private SuggestionCandidate(String label, String value, String field, String category,
                CandidateKind kind, int order) {
            this.label = label;
            this.value = value;
            this.field = field;
            this.category = category;
            this.kind = kind;
            this.order = order;
        }
    }

    private static final class RankedSuggestion {

        private String label;
        private String value;
        private String field;
        private String category;
        private String matchType;
        private int score;
        private boolean isContext;
        private boolean isPrefix;
        private int order;

        private SuggestionDto toDto() {
            return new SuggestionDto(label, value, field, category, matchType, score);
        }
    }
}
