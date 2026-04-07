export type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  stock: number
}

export type OrderResponse = {
  id: string
  total: number
  message: string
}
