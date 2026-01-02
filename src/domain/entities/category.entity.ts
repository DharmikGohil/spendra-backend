import { v4 as uuidv4 } from 'uuid';
import {
  InvalidCategoryNameError,
  InvalidCategorySlugError,
} from '../errors/category.errors.js';

/**
 * Props for creating a new category
 */
export interface CreateCategoryProps {
  name: string;
  slug: string;
  parentId?: string;
  icon?: string;
  color?: string;
  isSystem?: boolean;
}

/**
 * Category tree node - Category with nested children
 */
export interface CategoryTree {
  id: string;
  name: string;
  slug: string;
  parentId: string | undefined;
  icon: string | undefined;
  color: string | undefined;
  isSystem: boolean;
  children: CategoryTree[];
}

/**
 * Category entity - Immutable domain object representing a transaction category.
 * Categories can be hierarchical (parent-child relationships).
 */
export class Category {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly parentId: string | undefined,
    public readonly icon: string | undefined,
    public readonly color: string | undefined,
    public readonly isSystem: boolean
  ) {
    Object.freeze(this);
  }

  /**
   * Factory method to create a new Category entity.
   * Validates invariants before creation.
   */
  static create(props: CreateCategoryProps): Category {
    // Validate name
    if (!props.name || props.name.trim().length === 0) {
      throw new InvalidCategoryNameError(props.name ?? '');
    }

    // Validate slug
    if (!props.slug || props.slug.trim().length === 0) {
      throw new InvalidCategorySlugError(props.slug ?? '');
    }

    return new Category(
      uuidv4(),
      props.name.trim(),
      props.slug.trim().toLowerCase(),
      props.parentId,
      props.icon?.trim(),
      props.color?.trim(),
      props.isSystem ?? false
    );
  }

  /**
   * Reconstitute a Category entity from persistence data.
   * Used by mappers when loading from database.
   */
  static reconstitute(props: {
    id: string;
    name: string;
    slug: string;
    parentId: string | undefined;
    icon: string | undefined;
    color: string | undefined;
    isSystem: boolean;
  }): Category {
    return new Category(
      props.id,
      props.name,
      props.slug,
      props.parentId,
      props.icon,
      props.color,
      props.isSystem
    );
  }

  /**
   * Build a hierarchical tree from a flat list of categories.
   * Each category appears exactly once, with children nested under parents.
   */
  static buildTree(categories: Category[]): CategoryTree[] {
    // Create a map for quick lookup
    const categoryMap = new Map<string, CategoryTree>();
    const roots: CategoryTree[] = [];

    // First pass: create all tree nodes
    for (const cat of categories) {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        parentId: cat.parentId,
        icon: cat.icon,
        color: cat.color,
        isSystem: cat.isSystem,
        children: [],
      });
    }

    // Second pass: build tree structure
    for (const cat of categories) {
      const node = categoryMap.get(cat.id)!;
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          // Parent not found, treat as root
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    // Sort children alphabetically by name
    const sortChildren = (nodes: CategoryTree[]): void => {
      nodes.sort((a, b) => a.name.localeCompare(b.name));
      for (const node of nodes) {
        sortChildren(node.children);
      }
    };

    sortChildren(roots);

    return roots;
  }

  /**
   * Check if this is a root category (no parent).
   */
  isRoot(): boolean {
    return this.parentId === undefined;
  }

  /**
   * Convert to a tree node (without children - use buildTree for full tree).
   */
  toTreeNode(): CategoryTree {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      parentId: this.parentId,
      icon: this.icon,
      color: this.color,
      isSystem: this.isSystem,
      children: [],
    };
  }
}
