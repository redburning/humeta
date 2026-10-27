package redburning.github.io.humeta.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import redburning.github.io.humeta.entity.MetaboliteEntity;

/**
 * {@code metabolite} 表的 Spring Data JPA 仓库。
 *
 * <p>多条件检索与搜索框联想的匹配条件由 {@link MetaboliteSpecifications} 构造。</p>
 */
public interface MetaboliteRepository
        extends JpaRepository<MetaboliteEntity, String>, JpaSpecificationExecutor<MetaboliteEntity> {

    /**
     * 按 Humeta 编号查询，忽略大小写。
     */
    @Query("select m from MetaboliteEntity m where upper(m.id) = upper(:id)")
    Optional<MetaboliteEntity> findByIdIgnoreCase(@Param("id") String id);
}

