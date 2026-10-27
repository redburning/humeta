package redburning.github.io.humeta.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

/**
 * 代谢物搜索结果，字段与前端 {@code MetaboliteSearchRecord} 保持一致。
 *
 * <p>空值统一返回空字符串 / 空数组，方便前端直接渲染，无需再做非空判断。</p>
 */
@Data
public class MetaboliteDto {

    /** Humeta 编号，例如 IPTM00001E。 */
    private String id;

    /** 代谢物主编号（当前与 id 相同，保留字段是为了兼容前端模型）。 */
    private String metaboliteId;

    /** 其它可用于检索的编号（LIPID MAPS、SwissLipids）。 */
    private List<String> alternateIds = new ArrayList<>();

    /** 展示用英文名（多名称时取最后一个）。 */
    private String name;

    /** 展示用中文名（多名称时取最后一个）。 */
    private String chineseName;

    /** 英文 / 中文别名。 */
    private List<String> synonyms = new ArrayList<>();

    private String hmdb;
    private String kegg;
    private String chebi;
    private String formula;
    private String inchikey;
    private String smiles;

    /** 前端列表渲染使用的稳定 key，取 Humeta 编号。 */
    private String key;

    private String cas;
    private String pubchem;
    private String lipidMaps;
    private String swissLipids;

    /** 单同位素分子量，保留数据库精度并以字符串返回。 */
    private String monoisotopicMw;

    /** 展示用分类，优先取生化分类。 */
    private String category;

    /** 结构图地址，对应前端 {@code public/images/structures/{id}.svg}。 */
    private String structureImage;
}
