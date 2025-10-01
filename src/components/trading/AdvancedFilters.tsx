import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, RotateCcw } from "lucide-react";
import { useState } from "react";

export interface FilterState {
  minPrice: string;
  maxPrice: string;
  minMarketCap: string;
  maxMarketCap: string;
  minVolume: string;
  maxVolume: string;
  minChange: string;
  maxChange: string;
  sortBy: string;
  sortOrder: string;
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
}

export const AdvancedFilters = ({ onFilterChange, onReset }: AdvancedFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    minPrice: "",
    maxPrice: "",
    minMarketCap: "",
    maxMarketCap: "",
    minVolume: "",
    maxVolume: "",
    minChange: "",
    maxChange: "",
    sortBy: "market_cap",
    sortOrder: "desc",
  });

  const handleInputChange = (field: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      minPrice: "",
      maxPrice: "",
      minMarketCap: "",
      maxMarketCap: "",
      minVolume: "",
      maxVolume: "",
      minChange: "",
      maxChange: "",
      sortBy: "market_cap",
      sortOrder: "desc",
    };
    setFilters(resetFilters);
    onReset();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Advanced Filters</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
        <CardDescription>
          Filter cryptocurrencies by price, market cap, volume, and performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Price Range */}
          <div className="space-y-2">
            <Label>Price Range ($)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Min"
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleInputChange("minPrice", e.target.value)}
              />
              <Input
                placeholder="Max"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleInputChange("maxPrice", e.target.value)}
              />
            </div>
          </div>

          {/* Market Cap Range */}
          <div className="space-y-2">
            <Label>Market Cap (B)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Min"
                type="number"
                value={filters.minMarketCap}
                onChange={(e) => handleInputChange("minMarketCap", e.target.value)}
              />
              <Input
                placeholder="Max"
                type="number"
                value={filters.maxMarketCap}
                onChange={(e) => handleInputChange("maxMarketCap", e.target.value)}
              />
            </div>
          </div>

          {/* Volume Range */}
          <div className="space-y-2">
            <Label>24h Volume (M)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Min"
                type="number"
                value={filters.minVolume}
                onChange={(e) => handleInputChange("minVolume", e.target.value)}
              />
              <Input
                placeholder="Max"
                type="number"
                value={filters.maxVolume}
                onChange={(e) => handleInputChange("maxVolume", e.target.value)}
              />
            </div>
          </div>

          {/* 24h Change Range */}
          <div className="space-y-2">
            <Label>24h Change (%)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Min"
                type="number"
                value={filters.minChange}
                onChange={(e) => handleInputChange("minChange", e.target.value)}
              />
              <Input
                placeholder="Max"
                type="number"
                value={filters.maxChange}
                onChange={(e) => handleInputChange("maxChange", e.target.value)}
              />
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleInputChange("sortBy", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market_cap">Market Cap</SelectItem>
                <SelectItem value="current_price">Price</SelectItem>
                <SelectItem value="total_volume">Volume</SelectItem>
                <SelectItem value="price_change_percentage_24h">24h Change</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <Label>Sort Order</Label>
            <Select
              value={filters.sortOrder}
              onValueChange={(value) => handleInputChange("sortOrder", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};