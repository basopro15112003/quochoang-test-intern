import { useEffect, useMemo, useState } from 'react';
import type { Product } from '../models/product';

type ApiProduct = Omit<Product, 'inStock'>;

export function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [error, setError] = useState<string | null>(null)

    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('');
    const [sortByRating, setSortByRating] = useState<'sortRatingAsc' | 'sortRatingDesc' | ''>('');
    const [inStockOnly, setInStockOnly] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // số lượng sản phẩm trên 1 trang

    //#region  Fetch Product
    useEffect(() => {
        async function fetchProducts() {
            try {
                setError(null)
                const res = await fetch('https://dummyjson.com/products?limit=10')
                if (!res.ok) throw new Error('Failed to fetch products')
                const data = await res.json()
                const normalizedProducts: Product[] = (data.products as ApiProduct[]).map(product => ({
                    ...product,
                    inStock: product.stock > 0,
                }))
                setProducts(normalizedProducts)

            } catch (err) {
                setError((err as Error).message)
                console.log(error);
            }
        }
        fetchProducts()
    }, []
    )

    if (error) return <div className="p-10 text-center text-red-500">{error}</div>
    //#endregion 

    //#region Filtering by category
    const categories = useMemo(
        () => Array.from(new Set(products.map(p => p.category).filter(Boolean))),
        [products]
    )
    const filteredProducts = useMemo(() => {
        let results = products
        if (categoryFilter !== '') {
            results = results.filter(p => p.category === categoryFilter)
        }
        if (searchTerm !== '') {
            const query = searchTerm.toLowerCase()
            results = results.filter(p => p.title.toLowerCase().includes(query))
        }
        if (inStockOnly) {
            results = results.filter(p => p.inStock ?? p.stock > 0)
        }
        if (sortOrder === 'asc') {
            results = [...results].sort((a, b) => a.price - b.price)
        } else if (sortOrder === 'desc') {
            results = [...results].sort((a, b) => b.price - a.price)
        }
        if (sortByRating === 'sortRatingAsc') {
            results = [...results].sort((a, b) => a.rating - b.rating)
        } else if (sortByRating === 'sortRatingDesc') {
            results = [...results].sort((a, b) => b.rating - a.rating)
        }

        return results
    }, [products, categoryFilter, searchTerm, sortOrder, sortByRating, inStockOnly])

    const resultCountLabel = `${filteredProducts.length} ${filteredProducts.length === 1 ? 'result' : 'results'}`

    useEffect(() => {
        setCurrentPage(1)
    }, [categoryFilter, searchTerm, sortOrder, sortByRating, inStockOnly])
    //#endregion

    //#region Pagination
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, endIndex);
    //#endregion

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">

            <div className="mb-2 flex gap-2 flex-wrap">
                <div className="">
                    <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-2 text-left">Filter by Category</label>
                    <select
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                        Sort by Price
                    </label>
                    <select
                        id="sortOrder"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc' | '')}
                    >
                        <option key="default" value="">Default</option>
                        <option value="asc">Low to High</option>
                        <option value="desc">High to Low</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="sortByRating" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                        Sort by Rating
                    </label>
                    <select
                        id="sortByRating"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={sortByRating}
                        onChange={(e) => setSortByRating(e.target.value as 'sortRatingAsc' | 'sortRatingDesc' | '')}
                    >
                        <option value="">Default</option>
                        <option value="sortRatingDesc">High to Low</option>
                        <option value="sortRatingAsc">Low to High</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="priceFilter" className="block text-sm font-medium text-gray-700 mb-2 text-left">Search by Name</label>
                    <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

            </div>

            <div className=" mb-4 flex flex-wrap items-center justify-between gap-4">
                <span className="text-sm text-gray-600">{resultCountLabel}</span>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                    />
                    <span>In stock only</span>
                </label>
            </div>

            {/* Product Grid - 4 columns on large screens */}
            {currentProducts.length === 0 ? (
                <div className="w-full rounded-md border border-dashed border-gray-300 p-10 text-center text-gray-500">
                    No matches found
                </div>
            ) : (
                <div className="grid  grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ">
                    {currentProducts.map((product) => (
                        <div
                            key={product.id}
                            className="bg-white border border-gray-300 rounded-lg overflow-hidden group hover:shadow-lg transition-shadow duration-300"
                        >
                            {/* Image Container */}
                            <div className="relative bg-gray-100 aspect-square flex items-center justify-center overflow-hidden">
                                {/* Product Image */}
                                {product.thumbnail ? (
                                    <img
                                        src={product.thumbnail}
                                        alt={product.title}
                                        loading="lazy"
                                        className="w-full h-full object-contain p-4"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-400">No Image</span>
                                    </div>
                                )}

                                {/* Action Icons */}
                                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 hover:text-white transition-colors">
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                            />
                                        </svg>
                                    </button>
                                    <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 hover:text-white transition-colors">
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-4 flex flex-col gap-3">
                                <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
                                    {product.title}
                                </h3>

                                <div className="flex">
                                    <span className="text-sm text-gray-500 line-clamp-1 mr-1">Category: </span>
                                    <p className="text-sm text-gray-500 line-clamp-1">{product.category}</p>
                                </div>

                                <div className="flex items-center gap-1 text-sm text-amber-500" aria-label={`Rating ${product.rating} out of 5`}>
                                    <span aria-hidden="true">★</span>
                                    <span className="text-gray-700 font-medium">{product.rating.toFixed(1)} / 5</span>
                                </div>
                                {/* Price */}
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-semibold text-gray-900">
                                        ${product.price.toFixed(2)}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        className="flex-1 bg-red-600 text-white py-2 rounded-md text-sm font-semibold hover:bg-red-700 transition-colors"
                                        onClick={() => console.log('Buy', product.id)}
                                    >
                                        Buy Now
                                    </button>
                                    <button
                                        className="flex-1 border border-red-600 text-red-600 py-2 rounded-md text-sm font-semibold hover:bg-red-50 transition-colors"
                                        onClick={() => console.log('Add to cart', product.id)}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            <div className="mt-8 flex justify-center">
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                <span className="px-4 py-2 text-gray-700">{currentPage} / {totalPages}</span>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
            </div>
            {/* Pagination */}

        </div>
    );
}