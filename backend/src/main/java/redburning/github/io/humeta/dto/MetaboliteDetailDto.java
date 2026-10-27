package redburning.github.io.humeta.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

/**
 * 代谢物详情，结构对齐前端 {@code metaboliteDetails} 中的单条记录。
 *
 * <p>只包含 {@code metabolite} 表能提供的数据；表结构中没有的区块
 * （overview、spectra、tissue distribution、disease association 等）不返回。</p>
 */
@Data
public class MetaboliteDetailDto {

    private String id;

    private String heroLabel = "Metabolite Name";

    private String name;

    private String chineseName;

    private List<PropertyFieldDto> identifiers = new ArrayList<>();

    private ChemicalDescriptionDto chemicalDescription;

    private List<TaxonomyDto> taxonomy = new ArrayList<>();
}
