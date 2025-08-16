import { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FilterPanel({ onFilterChange, isVisible, onToggle }) {
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: [0, 1000],
    rating: 0,
    inStock: false,
  });

  const [openSections, setOpenSections] = useState({
    categories: true,
    price: true,
    rating: true,
    availability: true,
  });

  const categories = [
    "Electronics",
    "Clothing",
    "Home & Garden",
    "Books",
    "Sports & Outdoors",
    "Beauty & Personal Care",
    "Toys & Games",
    "Automotive",
  ];

  const updateFilters = (newFilters) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const handleCategoryChange = (category, checked) => {
    const updatedCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category);
    updateFilters({ categories: updatedCategories });
  };

  const clearFilters = () => {
    const cleared = {
      categories: [],
      priceRange: [0, 1000],
      rating: 0,
      inStock: false,
    };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!isVisible) return null;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-sm"
            >
              Clear all
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8 lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Categories */}
        <div>
          <button
            onClick={() => toggleSection('categories')}
            className="flex items-center justify-between w-full py-2 text-sm font-medium"
          >
            Categories
            {openSections.categories ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {openSections.categories && (
            <div className="space-y-2 mt-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={category}
                    checked={filters.categories.includes(category)}
                    onChange={(e) => handleCategoryChange(category, e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor={category} className="text-sm cursor-pointer">
                    {category}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price Range */}
        <div>
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full py-2 text-sm font-medium"
          >
            Price Range
            {openSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {openSections.price && (
            <div className="space-y-3 mt-2">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={(e) => updateFilters({ priceRange: [parseInt(e.target.value), filters.priceRange[1]] })}
                  className="w-20 px-2 py-1 border rounded text-sm"
                  min="0"
                  max="1000"
                />
                <span className="text-sm text-gray-500">to</span>
                <input
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={(e) => updateFilters({ priceRange: [filters.priceRange[0], parseInt(e.target.value)] })}
                  className="w-20 px-2 py-1 border rounded text-sm"
                  min="0"
                  max="1000"
                />
              </div>
            </div>
          )}
        </div>

        {/* Rating */}
        <div>
          <button
            onClick={() => toggleSection('rating')}
            className="flex items-center justify-between w-full py-2 text-sm font-medium"
          >
            Minimum Rating
            {openSections.rating ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {openSections.rating && (
            <div className="space-y-2 mt-2">
              {[4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`rating-${rating}`}
                    name="rating"
                    checked={filters.rating === rating}
                    onChange={() => updateFilters({ rating })}
                    className="rounded"
                  />
                  <label htmlFor={`rating-${rating}`} className="text-sm cursor-pointer">
                    {rating}+ stars
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Availability */}
        <div>
          <button
            onClick={() => toggleSection('availability')}
            className="flex items-center justify-between w-full py-2 text-sm font-medium"
          >
            Availability
            {openSections.availability ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {openSections.availability && (
            <div className="space-y-2 mt-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="in-stock"
                  checked={filters.inStock}
                  onChange={(e) => updateFilters({ inStock: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="in-stock" className="text-sm cursor-pointer">
                  In Stock Only
                </label>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 