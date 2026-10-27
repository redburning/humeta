package redburning.github.io.humeta.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.Getter;
import lombok.Setter;

/**
 * {@code metabolite} 表的一行（53 列）。
 *
 * <p>数据库列名与 Java 字段名并不完全一致（如 {@code metabolon_name_2022NC}、
 * {@code parent_level_1}、{@code class}），因此这里全部使用显式 {@code @Column}
 * 映射，避免依赖命名策略。</p>
 */
@Getter
@Setter
@Entity
@Table(name = "metabolite")
public class MetaboliteEntity {

    /** Humeta 编号，例如 IPTM00001E，主键。 */
    @Id
    @Column(name = "id", nullable = false, length = 20)
    private String id;

    @Column(name = "preferred_detection_mode")
    private String preferredDetectionMode;

    @Column(name = "primary_biological_locations")
    private String primaryBiologicalLocations;

    @Column(name = "structural_hierarchy")
    private String structuralHierarchy;

    @Column(name = "common_abbreviations")
    private String commonAbbreviations;

    @Column(name = "chinese_synonyms")
    private String chineseSynonyms;

    /** 列名包含大写后缀，必须显式映射。 */
    @Column(name = "metabolon_name_2022NC")
    private String metabolonName2022NC;

    /** 列名包含大写后缀，必须显式映射。 */
    @Column(name = "hmdb_name_2026V5")
    private String hmdbName2026V5;

    /** 英文名，多名称时以分号分隔，例如 "AcCa(2:0); Acetylcarnitine"。 */
    @Column(name = "name")
    private String name;

    /** 中文名，多名称时以分号分隔。 */
    @Column(name = "chinese_name")
    private String chineseName;

    @Column(name = "hmdb")
    private String hmdb;

    @Column(name = "pubchem")
    private String pubchem;

    @Column(name = "monoisotopic_mass")
    private Double monoisotopicMass;

    @Column(name = "average_mass")
    private Double averageMass;

    @Column(name = "formula")
    private String formula;

    @Column(name = "iupac_name")
    private String iupacName;

    @Column(name = "inchikey")
    private String inchikey;

    @Column(name = "smiles")
    private String smiles;

    @Column(name = "universal_smiles")
    private String universalSmiles;

    @Column(name = "charge_state")
    private Integer chargeState;

    @Column(name = "cas")
    private String cas;

    @Column(name = "chebi")
    private String chebi;

    @Column(name = "kegg")
    private String kegg;

    @Column(name = "lipid_maps")
    private String lipidMaps;

    @Column(name = "swiss_lipids")
    private String swissLipids;

    @Column(name = "common_synonyms")
    private String commonSynonyms;

    @Column(name = "human_metabolism_superclass")
    private String humanMetabolismSuperclass;

    @Column(name = "biochemical_class")
    private String biochemicalClass;

    @Column(name = "metabolic_subpathway")
    private String metabolicSubpathway;

    @Column(name = "kingdom")
    private String kingdom;

    @Column(name = "superclass")
    private String superclass;

    /** 数据库列名是 SQL 关键字 {@code class}。 */
    @Column(name = "class")
    private String chemicalClass;

    @Column(name = "subclass")
    private String subclass;

    @Column(name = "parent_level_1")
    private String parentLevel1;

    @Column(name = "parent_level_2")
    private String parentLevel2;

    @Column(name = "parent_level_3")
    private String parentLevel3;

    @Column(name = "parent_level_4")
    private String parentLevel4;

    @Column(name = "parent_level_5")
    private String parentLevel5;

    @Column(name = "parent_level_6")
    private String parentLevel6;

    @Column(name = "alogp")
    private Double alogp;

    @Column(name = "molecular_refractivity")
    private Double molecularRefractivity;

    @Column(name = "num_h_bond_donors")
    private Integer numHBondDonors;

    @Column(name = "num_h_bond_acceptors")
    private Integer numHBondAcceptors;

    @Column(name = "topological_psa")
    private Double topologicalPsa;

    @Column(name = "fraction_csp3")
    private Double fractionCsp3;

    @Column(name = "num_rotatable_bonds")
    private Integer numRotatableBonds;

    @Column(name = "num_aromatic_rings")
    private Integer numAromaticRings;

    @Column(name = "number_of_heavy_atoms")
    private Integer numberOfHeavyAtoms;

    @Column(name = "number_of_rings")
    private Integer numberOfRings;

    @Column(name = "num_chiral_centers")
    private Integer numChiralCenters;

    @Column(name = "num_aliphatic_rings")
    private Integer numAliphaticRings;

    @Column(name = "violations_of_lipinski_rule")
    private Integer violationsOfLipinskiRule;

    @Column(name = "violations_of_veber_rule")
    private Integer violationsOfVeberRule;
}

