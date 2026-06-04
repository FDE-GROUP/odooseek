import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/product/')({
  beforeLoad: () => {
    throw redirect({ to: '/product/products' })
  },
})
