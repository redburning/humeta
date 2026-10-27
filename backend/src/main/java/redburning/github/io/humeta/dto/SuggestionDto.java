package redburning.github.io.humeta.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 搜索框联想项，字段与前端 {@code SuggestionItem} 保持一致。
 */
@Data
@AllArgsConstructor
public class SuggestionDto {

    /** 展示文本，例如 "L-Tryptophan"、"HMDB0000929"。 */
    private String label;

    /** 选中后用于检索的值（名称类联想会归一为主名称）。 */
    private String value;

    private String field;

    /** Metabolite / Identifier / Formula / Structure。 */
    private String category;

    /** exact / identifier / alias / fuzzy。 */
    private String matchType;

    private int score;
}
