export type ProductWithBadge = {
  id: string
  slug: string
  name: string
  price: number
  comparePrice: number | null
  images: string[]
  stock: number
  showStock: boolean
  trackStock: boolean
  badge: { text: string; color: string; type: string } | null
}

export type CategoryItem = {
  id: string
  slug: string
  name: string
  imageUrl: string | null
  icon: string | null
}

export type BannerItem = {
  id: string
  type: string
  imageUrl: string | null
  title: string | null
  subtitle: string | null
  linkUrl: string | null
  linkText: string | null
  position: string
}

export type HomeTemplateProps = {
  heroBanners: BannerItem[]
  promoBannersTop: BannerItem[]
  promoBannersMiddle: BannerItem[]
  promoBannersBottom: BannerItem[]
  marqueeTexts: string[]
  featuredProducts: ProductWithBadge[]
  offerProducts: ProductWithBadge[]
  categories: CategoryItem[]
  tenantName: string
}
