package redburning.github.io.humeta.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 分页结果。
 */
@Data
@AllArgsConstructor
public class MetabolitePageDto {

    private List<MetaboliteDto> items = new ArrayList<>();

    /** 满足条件的总记录数（不受分页影响）。 */
    private long total;

    /** 当前页码，从 1 开始。 */
    private int page;

    private int size;

    private int totalPages;
}
