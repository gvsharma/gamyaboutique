package com.gamyacouture.catalog.application;

import com.gamyacouture.catalog.api.dto.CategoryTreeNodeDto;
import com.gamyacouture.catalog.domain.Category;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class CategoryTreeBuilder {

    public List<CategoryTreeNodeDto> build(List<Category> categories) {
        Map<UUID, MutableNode> nodes = new HashMap<>();
        for (Category category : categories) {
            nodes.put(category.getId(), MutableNode.from(category));
        }

        List<CategoryTreeNodeDto> roots = new ArrayList<>();
        for (Category category : categories) {
            MutableNode node = nodes.get(category.getId());
            UUID parentId = category.getParent() != null ? category.getParent().getId() : null;
            if (parentId == null) {
                roots.add(node.toDto());
            } else {
                MutableNode parent = nodes.get(parentId);
                if (parent != null) {
                    parent.children.add(node);
                } else {
                    roots.add(node.toDto());
                }
            }
        }

        roots.sort(Comparator.comparingInt(CategoryTreeNodeDto::displayOrder).thenComparing(CategoryTreeNodeDto::name));
        return roots;
    }

    private static final class MutableNode {
        private final UUID id;
        private final String name;
        private final String slug;
        private final String description;
        private final int displayOrder;
        private final int depth;
        private final String imageUrl;
        private final List<MutableNode> children = new ArrayList<>();

        private MutableNode(UUID id, String name, String slug, String description, int displayOrder, int depth,
                            String imageUrl) {
            this.id = id;
            this.name = name;
            this.slug = slug;
            this.description = description;
            this.displayOrder = displayOrder;
            this.depth = depth;
            this.imageUrl = imageUrl;
        }

        static MutableNode from(Category category) {
            return new MutableNode(
                    category.getId(),
                    category.getName(),
                    category.getSlug(),
                    category.getDescription(),
                    category.getDisplayOrder(),
                    category.getDepth(),
                    category.getImageUrl());
        }

        CategoryTreeNodeDto toDto() {
            children.sort(Comparator.comparingInt((MutableNode n) -> n.displayOrder)
                    .thenComparing((MutableNode n) -> n.name));
            List<CategoryTreeNodeDto> childDtos = children.stream().map(MutableNode::toDto).toList();
            return new CategoryTreeNodeDto(id, name, slug, description, displayOrder, depth, imageUrl, childDtos);
        }
    }
}
