package redburning.github.io.humeta.repository;

import java.util.List;
import java.util.Locale;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Path;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import org.springframework.data.jpa.domain.Specification;

import redburning.github.io.humeta.dto.MetaboliteQuery;
import redburning.github.io.humeta.entity.MetaboliteEntity;

/**
 * {@code metabolite} 表的查询条件。
 *
 * <p>检索语义：</p>
 * <ul>
 *   <li>{@code name}：名称 / 中文名 / 中英文别名包含关键字；</li>
 *   <li>{@code id}：Humeta 编号精确或前缀匹配，也匹配 LIPID MAPS / SwissLipids；</li>
 *   <li>{@code hmdb}/{@code kegg}/{@code chebi}/{@code formula}/{@code inchikey}：忽略大小写精确匹配；</li>
 *   <li>{@code smiles}：包含关键字。</li>
 * </ul>
 */
public final class MetaboliteSpecifications {

    /**
     * LIKE 转义符。使用 {@code !} 而不是反斜杠，避免 MySQL 字符串字面量转义问题。
     */
    private static final char LIKE_ESCAPE = '!';

    private MetaboliteSpecifications() {
    }

    /**
     * 多个检索条件之间为 AND；没有有效条件时返回 {@code null}（表示不过滤）。
     */
    public static Specification<MetaboliteEntity> byQueries(List<MetaboliteQuery> queries) {
        if (queries == null || queries.isEmpty()) {
            return null;
        }

        Specification<MetaboliteEntity> specification = null;
        for (MetaboliteQuery query : queries) {
            Specification<MetaboliteEntity> condition = byQuery(query);
            if (condition == null) {
                continue;
            }
            specification = specification == null ? condition : specification.and(condition);
        }
        return specification;
    }

    /**
     * 搜索框联想的候选条件：任意可检索列包含关键字。
     */
    public static Specification<MetaboliteEntity> byKeyword(String keyword) {
        String pattern = "%" + escapeLike(keyword.trim()) + "%";
        return (root, query, builder) -> builder.or(
                like(root, builder, "name", pattern),
                like(root, builder, "chineseName", pattern),
                like(root, builder, "commonSynonyms", pattern),
                like(root, builder, "chineseSynonyms", pattern),
                like(root, builder, "id", pattern),
                like(root, builder, "hmdb", pattern),
                like(root, builder, "kegg", pattern),
                like(root, builder, "chebi", pattern),
                like(root, builder, "formula", pattern),
                like(root, builder, "inchikey", pattern),
                like(root, builder, "smiles", pattern));
    }

    private static Specification<MetaboliteEntity> byQuery(MetaboliteQuery query) {
        if (query == null || query.getKeyword() == null || query.getKeyword().trim().isEmpty()) {
            return null;
        }

        String keyword = query.getKeyword().trim();
        String field = query.getField() == null
                ? ""
                : query.getField().trim().toLowerCase(Locale.ROOT);

        switch (field) {
            case "id":
                return byId(keyword);
            case "hmdb":
            case "kegg":
            case "chebi":
            case "formula":
            case "inchikey":
                return byIdentifier(field, keyword);
            case "smiles":
                return contains("smiles", keyword);
            case "name":
            default:
                return byName(keyword);
        }
    }

    private static Specification<MetaboliteEntity> byName(String keyword) {
        String pattern = "%" + escapeLike(keyword) + "%";
        return (root, query, builder) -> builder.or(
                like(root, builder, "name", pattern),
                like(root, builder, "chineseName", pattern),
                like(root, builder, "commonSynonyms", pattern),
                like(root, builder, "chineseSynonyms", pattern));
    }

    private static Specification<MetaboliteEntity> byId(String keyword) {
        String upperKeyword = keyword.toUpperCase(Locale.ROOT);
        String prefixPattern = escapeLike(upperKeyword) + "%";
        return (root, query, builder) -> builder.or(
                builder.equal(builder.upper(text(root, "id")), upperKeyword),
                builder.like(builder.upper(text(root, "id")), prefixPattern, LIKE_ESCAPE),
                builder.equal(builder.upper(text(root, "lipidMaps")), upperKeyword),
                builder.equal(builder.upper(text(root, "swissLipids")), upperKeyword));
    }

    private static Specification<MetaboliteEntity> byIdentifier(String field, String keyword) {
        String upperKeyword = keyword.toUpperCase(Locale.ROOT);
        return (root, query, builder) ->
                builder.equal(builder.upper(text(root, field)), upperKeyword);
    }

    private static Specification<MetaboliteEntity> contains(String field, String keyword) {
        String pattern = "%" + escapeLike(keyword) + "%";
        return (root, query, builder) -> like(root, builder, field, pattern);
    }

    private static Predicate like(Root<MetaboliteEntity> root, CriteriaBuilder builder,
            String field, String pattern) {
        return builder.like(text(root, field), pattern, LIKE_ESCAPE);
    }

    private static Path<String> text(Root<MetaboliteEntity> root, String field) {
        return root.get(field);
    }

    private static String escapeLike(String value) {
        return value.replace("!", "!!")
                .replace("%", "!%")
                .replace("_", "!_");
    }
}
