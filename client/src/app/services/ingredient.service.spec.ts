import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Ingredient {
  id?: number;
  code: string; // 商品コード (例: "1110001")
  name: string;
  category: string;
  purchase_price: number;
  purchase_quantity: number;
  unit: string;
  yield_rate: number;
  allergens?: string;
}

@Injectable({
  providedIn: 'root'
})
export class IngredientService {
  private apiUrl = 'http://localhost:3000/api/ingredients';

  constructor(private http: HttpClient) {}

  getIngredients(): Observable<Ingredient[]> {
    return this.http.get<Ingredient[]>(this.apiUrl);
  }

  addIngredient(ingredient: Ingredient): Observable<any> {
    return this.http.post<any>(this.apiUrl, ingredient);
  }

  // 自動採番されたコードを取得するAPI
  getNextCode(category: string, name: string): Observable<{ nextCode: string }> {
    return this.http.get<{ nextCode: string }>(`${this.apiUrl}/next-code`, {
      params: { category, name }
    });
  }
}