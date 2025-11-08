import { Schema } from '../types/schema';

export const createDummyData = (): Schema[] => {
  const now = Date.now();
  
  // E-commerce Schema
  const ecommerceSchema: Schema = {
    id: 'dummy-ecommerce-1',
    name: 'E-commerce System',
    description: 'A complete e-commerce platform schema with products, orders, and users',
    createdAt: now - 86400000, // 1 day ago
    updatedAt: now - 3600000, // 1 hour ago
    entities: [
      {
        id: 'entity-user',
        name: 'User',
        position: { x: 100, y: 100 },
        fields: [
          {
            id: 'field-user-id',
            name: 'id',
            type: 'number',
            required: true,
          },
          {
            id: 'field-user-email',
            name: 'email',
            type: 'string',
            required: true,
          },
          {
            id: 'field-user-name',
            name: 'name',
            type: 'string',
            required: true,
          },
          {
            id: 'field-user-password',
            name: 'password',
            type: 'string',
            required: true,
          },
          {
            id: 'field-user-created',
            name: 'createdAt',
            type: 'date',
            required: true,
          },
        ],
      },
      {
        id: 'entity-product',
        name: 'Product',
        position: { x: 500, y: 100 },
        fields: [
          {
            id: 'field-product-id',
            name: 'id',
            type: 'number',
            required: true,
          },
          {
            id: 'field-product-title',
            name: 'title',
            type: 'string',
            required: true,
          },
          {
            id: 'field-product-description',
            name: 'description',
            type: 'string',
            required: false,
          },
          {
            id: 'field-product-price',
            name: 'price',
            type: 'number',
            required: true,
          },
          {
            id: 'field-product-stock',
            name: 'stock',
            type: 'number',
            required: true,
          },
          {
            id: 'field-product-active',
            name: 'isActive',
            type: 'boolean',
            required: true,
          },
          {
            id: 'field-product-metadata',
            name: 'metadata',
            type: 'object',
            required: false,
            nestedFields: [
              {
                id: 'nested-meta-tags',
                name: 'tags',
                type: 'array',
                required: false,
                arrayItemType: { type: 'primitive', value: 'string' },
              },
              {
                id: 'nested-meta-dimensions',
                name: 'dimensions',
                type: 'object',
                required: false,
                nestedFields: [
                  {
                    id: 'nested-dim-width',
                    name: 'width',
                    type: 'number',
                    required: true,
                  },
                  {
                    id: 'nested-dim-height',
                    name: 'height',
                    type: 'number',
                    required: true,
                  },
                  {
                    id: 'nested-dim-depth',
                    name: 'depth',
                    type: 'number',
                    required: true,
                  },
                ],
              },
              {
                id: 'nested-meta-reviews',
                name: 'reviews',
                type: 'array',
                required: false,
                arrayItemType: {
                  type: 'object',
                  fields: [
                    {
                      id: 'nested-review-rating',
                      name: 'rating',
                      type: 'number',
                      required: true,
                    },
                    {
                      id: 'nested-review-comment',
                      name: 'comment',
                      type: 'string',
                      required: false,
                    },
                    {
                      id: 'nested-review-author',
                      name: 'author',
                      type: 'object',
                      required: true,
                      nestedFields: [
                        {
                          id: 'nested-author-name',
                          name: 'name',
                          type: 'string',
                          required: true,
                        },
                        {
                          id: 'nested-author-email',
                          name: 'email',
                          type: 'string',
                          required: false,
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
      {
        id: 'entity-order',
        name: 'Order',
        position: { x: 300, y: 400 },
        fields: [
          {
            id: 'field-order-id',
            name: 'id',
            type: 'number',
            required: true,
          },
          {
            id: 'field-order-userId',
            name: 'userId',
            type: 'number',
            required: true,
          },
          {
            id: 'field-order-total',
            name: 'total',
            type: 'number',
            required: true,
          },
          {
            id: 'field-order-status',
            name: 'status',
            type: 'string',
            required: true,
          },
          {
            id: 'field-order-date',
            name: 'orderDate',
            type: 'date',
            required: true,
          },
        ],
      },
      {
        id: 'entity-orderitem',
        name: 'OrderItem',
        position: { x: 700, y: 400 },
        fields: [
          {
            id: 'field-orderitem-id',
            name: 'id',
            type: 'number',
            required: true,
          },
          {
            id: 'field-orderitem-orderId',
            name: 'orderId',
            type: 'number',
            required: true,
          },
          {
            id: 'field-orderitem-productId',
            name: 'productId',
            type: 'number',
            required: true,
          },
          {
            id: 'field-orderitem-quantity',
            name: 'quantity',
            type: 'number',
            required: true,
          },
          {
            id: 'field-orderitem-price',
            name: 'price',
            type: 'number',
            required: true,
          },
        ],
      },
      {
        id: 'entity-category',
        name: 'Category',
        position: { x: 500, y: 600 },
        fields: [
          {
            id: 'field-category-id',
            name: 'id',
            type: 'number',
            required: true,
          },
          {
            id: 'field-category-name',
            name: 'name',
            type: 'string',
            required: true,
          },
          {
            id: 'field-category-slug',
            name: 'slug',
            type: 'string',
            required: true,
          },
          {
            id: 'field-category-description',
            name: 'description',
            type: 'string',
            required: false,
          },
        ],
      },
    ],
    relationships: [
      {
        id: 'rel-user-order',
        fromEntityId: 'entity-user',
        toEntityId: 'entity-order',
        type: 'one-to-many',
        name: 'places',
      },
      {
        id: 'rel-order-orderitem',
        fromEntityId: 'entity-order',
        toEntityId: 'entity-orderitem',
        type: 'one-to-many',
        name: 'contains',
      },
      {
        id: 'rel-product-orderitem',
        fromEntityId: 'entity-product',
        toEntityId: 'entity-orderitem',
        type: 'one-to-many',
        name: 'included_in',
      },
      {
        id: 'rel-product-category',
        fromEntityId: 'entity-product',
        toEntityId: 'entity-category',
        type: 'many-to-many',
        name: 'belongs_to',
      },
    ],
  };

  // Blog System Schema
  const blogSchema: Schema = {
    id: 'dummy-blog-1',
    name: 'Blog Platform',
    description: 'A blogging platform with posts, authors, and comments',
    createdAt: now - 172800000, // 2 days ago
    updatedAt: now - 7200000, // 2 hours ago
    entities: [
      {
        id: 'entity-author',
        name: 'Author',
        position: { x: 150, y: 150 },
        fields: [
          {
            id: 'field-author-id',
            name: 'id',
            type: 'number',
            required: true,
          },
          {
            id: 'field-author-username',
            name: 'username',
            type: 'string',
            required: true,
          },
          {
            id: 'field-author-email',
            name: 'email',
            type: 'string',
            required: true,
          },
          {
            id: 'field-author-bio',
            name: 'bio',
            type: 'string',
            required: false,
          },
          {
            id: 'field-author-avatar',
            name: 'avatarUrl',
            type: 'string',
            required: false,
          },
        ],
      },
      {
        id: 'entity-post',
        name: 'Post',
        position: { x: 550, y: 150 },
        fields: [
          {
            id: 'field-post-id',
            name: 'id',
            type: 'number',
            required: true,
          },
          {
            id: 'field-post-title',
            name: 'title',
            type: 'string',
            required: true,
          },
          {
            id: 'field-post-content',
            name: 'content',
            type: 'string',
            required: true,
          },
          {
            id: 'field-post-excerpt',
            name: 'excerpt',
            type: 'string',
            required: false,
          },
          {
            id: 'field-post-published',
            name: 'publishedAt',
            type: 'date',
            required: false,
          },
          {
            id: 'field-post-featured',
            name: 'isFeatured',
            type: 'boolean',
            required: true,
          },
        ],
      },
      {
        id: 'entity-comment',
        name: 'Comment',
        position: { x: 350, y: 450 },
        fields: [
          {
            id: 'field-comment-id',
            name: 'id',
            type: 'number',
            required: true,
          },
          {
            id: 'field-comment-postId',
            name: 'postId',
            type: 'number',
            required: true,
          },
          {
            id: 'field-comment-author',
            name: 'authorName',
            type: 'string',
            required: true,
          },
          {
            id: 'field-comment-content',
            name: 'content',
            type: 'string',
            required: true,
          },
          {
            id: 'field-comment-created',
            name: 'createdAt',
            type: 'date',
            required: true,
          },
        ],
      },
      {
        id: 'entity-tag',
        name: 'Tag',
        position: { x: 750, y: 450 },
        fields: [
          {
            id: 'field-tag-id',
            name: 'id',
            type: 'number',
            required: true,
          },
          {
            id: 'field-tag-name',
            name: 'name',
            type: 'string',
            required: true,
          },
          {
            id: 'field-tag-slug',
            name: 'slug',
            type: 'string',
            required: true,
          },
        ],
      },
    ],
    relationships: [
      {
        id: 'rel-author-post',
        fromEntityId: 'entity-author',
        toEntityId: 'entity-post',
        type: 'one-to-many',
        name: 'writes',
      },
      {
        id: 'rel-post-comment',
        fromEntityId: 'entity-post',
        toEntityId: 'entity-comment',
        type: 'one-to-many',
        name: 'has',
      },
      {
        id: 'rel-post-tag',
        fromEntityId: 'entity-post',
        toEntityId: 'entity-tag',
        type: 'many-to-many',
        name: 'tagged_with',
      },
    ],
  };

  return [ecommerceSchema, blogSchema];
};

