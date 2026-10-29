package redburning.github.io.humeta.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 详情页 Overview 区块，结构对齐前端 {@code metaboliteDetails[].overview}。
 */
@Data
@AllArgsConstructor
public class MetaboliteOverviewDto {

    private String label;

    private String value;

    /**
     * 依次为中文介绍、英文介绍（缺失的语言不放入）。
     */
    private List<String> description = new ArrayList<>();
}
