package redburning.github.io.humeta.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

/**
 * 详情页的化学描述区块。
 */
@Data
public class ChemicalDescriptionDto {

    /** 每行 1~2 个字段，前端按行渲染。 */
    private List<List<PropertyFieldDto>> rows = new ArrayList<>();

    private String structureImage;

    private String structureAlt;

    private String structureDownloadName;
}
