package redburning.github.io.humeta.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import redburning.github.io.humeta.dto.MetaboliteDetailDto;
import redburning.github.io.humeta.dto.MetaboliteSearchRequest;
import redburning.github.io.humeta.dto.Result;
import redburning.github.io.humeta.service.MetaboliteService;

/**
 * 代谢物检索接口。
 *
 * <pre>
 * POST /api/metabolites/search          多条件分页检索 / 浏览
 * GET  /api/metabolites/suggestions     搜索框联想
 * GET  /api/metabolites/count           总记录数
 * GET  /api/metabolites/{id}            按 Humeta 编号查询
 * </pre>
 */
@RestController
@RequestMapping("/api/metabolites")
public class MetaboliteController {

    private final MetaboliteService metaboliteService;

    public MetaboliteController(MetaboliteService metaboliteService) {
        this.metaboliteService = metaboliteService;
    }

    @PostMapping("/search")
    public Result search(@RequestBody(required = false) MetaboliteSearchRequest request) {
        return Result.success(metaboliteService.search(request));
    }

    @GetMapping("/count")
    public Result count() {
        return Result.success(metaboliteService.count());
    }

    @GetMapping("/suggestions")
    public Result suggestions(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "limit", required = false) Integer limit) {
        return Result.success(metaboliteService.suggest(keyword, limit));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Result> detail(@PathVariable("id") String id) {
        MetaboliteDetailDto metabolite = metaboliteService.findDetailById(id);
        if (metabolite == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Result.error("Metabolite not found: " + id));
        }
        return ResponseEntity.ok(Result.success(metabolite));
    }
}
