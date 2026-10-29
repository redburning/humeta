package redburning.github.io.humeta.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.Getter;
import lombok.Setter;

/**
 * {@code metabolite_desc} 表：代谢物的中英文介绍。
 */
@Getter
@Setter
@Entity
@Table(name = "metabolite_desc")
public class MetaboliteDescEntity {

    /** Humeta 编号，例如 IPTM00263E。 */
    @Id
    @Column(name = "id", nullable = false, length = 255)
    private String id;

    @Column(name = "desc_cn")
    private String descCn;

    @Column(name = "desc_en")
    private String descEn;
}
