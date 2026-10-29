package redburning.github.io.humeta.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import redburning.github.io.humeta.entity.MetaboliteDescEntity;

/**
 * {@code metabolite_desc} 表仓库。
 */
public interface MetaboliteDescRepository extends JpaRepository<MetaboliteDescEntity, String> {
}
