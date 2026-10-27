package redburning.github.io.humeta.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 分类树节点。
 */
@Data
@AllArgsConstructor
public class TaxonomyNodeDto {

    private String id;

    private String rank;

    private String label;

    private List<TaxonomyNodeDto> children = new ArrayList<>();
}
