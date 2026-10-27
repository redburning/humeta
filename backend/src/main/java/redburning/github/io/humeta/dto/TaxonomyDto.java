package redburning.github.io.humeta.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 详情页的化学分类树。
 */
@Data
@AllArgsConstructor
public class TaxonomyDto {

    private String id;

    private String title;

    private TaxonomyNodeDto tree;
}
