package redburning.github.io.humeta.dto;

import java.util.List;

import lombok.Data;

/**
 * 代谢物检索请求。
 *
 * <p>多个查询条件之间是 AND 关系；{@code queries} 为空表示浏览全部记录。</p>
 */
@Data
public class MetaboliteSearchRequest {

    private List<MetaboliteQuery> queries;

    /** 页码，从 1 开始，缺省 1。 */
    private Integer page;

    /**
     * 每页条数，缺省 20，最大 2000。
     */
    private Integer size;
}
