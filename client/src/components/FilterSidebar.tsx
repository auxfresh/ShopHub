import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";

interface FilterSidebarProps {
  filters: {
    minPrice: string;
    maxPrice: string;
    rating: number | null;
    freeShipping: boolean;
    inStock: boolean;
  };
  onFiltersChange: (filters: any) => void;
}

export function FilterSidebar({ filters, onFiltersChange }: FilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handlePriceFilter = () => {
    onFiltersChange({
      ...filters,
      minPrice: localFilters.minPrice,
      maxPrice: localFilters.maxPrice,
    });
  };

  const handleRatingFilter = (rating: number) => {
    onFiltersChange({
      ...filters,
      rating: filters.rating === rating ? null : rating,
    });
  };

  const handleCheckboxFilter = (key: string, checked: boolean) => {
    onFiltersChange({
      ...filters,
      [key]: checked,
    });
  };

  const renderStars = (count: number, filled: boolean = false) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < count
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="w-64">
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Price Range
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Min"
              value={localFilters.minPrice}
              onChange={(e) => setLocalFilters({
                ...localFilters,
                minPrice: e.target.value
              })}
              className="w-20 text-sm"
            />
            <span className="text-gray-500">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={localFilters.maxPrice}
              onChange={(e) => setLocalFilters({
                ...localFilters,
                maxPrice: e.target.value
              })}
              className="w-20 text-sm"
            />
            <Button 
              size="sm" 
              onClick={handlePriceFilter}
              className="bg-ali-orange hover:bg-ali-orange-dark"
            >
              Go
            </Button>
          </div>
        </div>

        <Separator />

        {/* Customer Rating */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Customer Rating
          </Label>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={filters.rating === rating}
                  onCheckedChange={() => handleRatingFilter(rating)}
                />
                <div className="flex items-center space-x-2">
                  {renderStars(rating)}
                  <span className="text-sm text-gray-600">
                    {rating === 5 ? "5 stars" : `${rating}+ stars`}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <Separator />

        {/* Shipping Options */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Shipping
          </Label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                checked={filters.freeShipping}
                onCheckedChange={(checked) => 
                  handleCheckboxFilter("freeShipping", checked as boolean)
                }
              />
              <span className="text-sm text-gray-600">Free Shipping</span>
            </label>
          </div>
        </div>

        <Separator />

        {/* Availability */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Availability
          </Label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                checked={filters.inStock}
                onCheckedChange={(checked) => 
                  handleCheckboxFilter("inStock", checked as boolean)
                }
              />
              <span className="text-sm text-gray-600">In Stock</span>
            </label>
          </div>
        </div>

        <Separator />

        {/* Clear Filters */}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => onFiltersChange({
            minPrice: "",
            maxPrice: "",
            rating: null,
            freeShipping: false,
            inStock: false,
          })}
        >
          Clear All Filters
        </Button>
      </CardContent>
    </Card>
  );
}
