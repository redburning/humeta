package redburning.github.io.humeta.dto;

import lombok.Data;

/**
 * 单个检索条件。
 *
 * <p>{@code field} 取值与前端 {@code SearchField} 一致：
 * {@code name}、{@code id}、{@code hmdb}、{@code kegg}、{@code chebi}、
 * {@code formula}、{@code inchikey}、{@code smiles}。</p>
 */
@Data
public class MetaboliteQuery {

    private String keyword;

    private String field;
}
