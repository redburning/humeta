package redburning.github.io.humeta.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 详情页的单个字段（{@code label} + {@code value}）。
 */
@Data
@AllArgsConstructor
public class PropertyFieldDto {

    private String label;

    private String value;

    /** 是否跨整行展示（同义词等长文本）。 */
    private boolean wide;

    public static PropertyFieldDto of(String label, String value) {
        return new PropertyFieldDto(label, value, false);
    }

    public static PropertyFieldDto wide(String label, String value) {
        return new PropertyFieldDto(label, value, true);
    }
}
