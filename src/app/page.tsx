
import { Nav } from '@/Components/Nav';
import { getHomeProducts } from '@/getHomeproduct';
import Card from "@mui/material/Card";

export default async function Page() {
  const product = await getHomeProducts();
  return (
    
    <>

    <Nav />
            <section className="bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 py-24 text-center">
            <h1 className="text-4xl font-bold sm:text-6xl">
              Discover Products You’ll Love
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              Premium quality items curated just for you.
            </p>
    
            <div className="mt-8 flex justify-center gap-4">
              {/* <Link
                href="/products"
                className="rounded-md bg-black px-6 py-3 text-white"
              >
                Shop Now
              </Link>
              <Link
                href="/sign-up"
                className="rounded-md border px-6 py-3"
              >
                Create Account
              </Link> */}
            </div>
          </div>
        </section>
    
        {/* secondary section */}
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="mb-10 text-3xl font-bold">Featured Products</h2>
    
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {product.slice(0,8).map((products: any, i: number) => (
                <Card 
                variant="outlined"
                  key={i}
                  className="rounded-lg border bg-white p-4"
                >
                  <img  className="object-cover w-full h-70 rounded" src={products?.image ?? ""} alt={products?.title ?? "Product Image"}   />
                
                  <h3 className="font-semibold">{products?.title ?? 'Product Name'}</h3>
                  <p className="text-sm text-gray-600">{products?.price ? `$${products.price}` : '$99.99'}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>S
    </>
    
  )
}



