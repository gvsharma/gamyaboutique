# JPA entity map

All business entities extend `BaseSoftDeletableEntity` (`deleted_at` filter via `@SQLRestriction`).

## Relationships

| Entity | Relationships |
|--------|----------------|
| `UserAccount` | `@ManyToMany` → `RoleEntity` via `user_roles` |
| `Customer` | `@OneToOne` → `UserAccount`; `@OneToMany` → `Address` |
| `Category` | `@ManyToOne` parent; `@OneToMany` children; `path` + `depth` for hierarchy |
| `Product` | `@ManyToOne` primary category, fabric, print, offer; `@OneToMany` images; `@ManyToMany` categories, tags, seasonal collections |
| `CustomerInterest` | `@ManyToOne` product, customer |
| `ManualOrder` | `@ManyToOne` customer; `@OneToMany` items |
| `ManualOrderItem` | `@ManyToOne` order, product |
| `Notification` | `@ManyToOne` user and/or customer |

## Package layout

```
com.gamyacouture
├── auth.domain          UserAccount, RoleEntity, RoleCode
├── catalog.domain       Category, Fabric, Print, Tag, Offer, SeasonalCollection
├── product.domain       Product, ProductImage, ProductStatus, ProductCategoryLink
├── customer.domain      Customer, Address
├── crm.domain           CustomerInterest, ManualOrder, ManualOrderItem, CrmLead
├── notification.domain  Notification, NotificationOutbox
└── shared.domain        BaseAuditableEntity, BaseSoftDeletableEntity
```

## Soft delete

Set `deletedAt = Instant.now()` in the service layer. Hibernate excludes soft-deleted rows on all entities using `BaseSoftDeletableEntity`.

To include deleted rows in admin queries, use a native query or a separate repository method with `@Query` and no restriction.
