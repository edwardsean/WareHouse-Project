export interface Product {
  productid: number;
  customerid: number | null;
  name: string;
  category: string;
  weightperunit: number;
  volumeperunit: number;
}