import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  newIngredient = {
    id: null as number | null,
    code: '',
    name: '',
    category: '牛肉',
    purchase_price: 0,
    purchase_quantity: 0,
    unit: 'g',
    yield_rate: 100,
    allergens: ''
  };

  isEditing = false;
  ingredients: any[] = [];
  units: string[] = ['g', 'kg', 'ml', 'L', '個', '本', '枚', 'パック'];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadIngredients();
    this.onInputChanged();
  }

  // カテゴリ変更等でコード自動採番
  onInputChanged() {
    if (this.isEditing) return; // 編集モード時は採番しない

    const params = {
      category: this.newIngredient.category,
      name: this.newIngredient.name
    };
    this.http.get<{ nextCode: string }>('http://localhost:3000/api/ingredients/next-code', { params })
      .subscribe({
        next: (data) => {
          this.newIngredient.code = data.nextCode;
        },
        error: (err) => console.error('コード取得エラー:', err)
      });
  }

  // 原材料一覧取得
  loadIngredients() {
    this.http.get<any[]>('http://localhost:3000/api/ingredients')
      .subscribe({
        next: (data) => {
          this.ingredients = data;
        },
        error: (err) => console.error('一覧取得エラー:', err)
      });
  }

  // 「編集」ボタンが押された時
  onEdit(item: any) {
    this.isEditing = true;
    this.newIngredient = { ...item };
  }

  // 編集キャンセル
  cancelEdit() {
    this.isEditing = false;
    this.resetForm();
  }

  // 登録または更新処理
  onSubmit() {
    if (this.isEditing && this.newIngredient.id) {
      // 修正（PUT）
      this.http.put(`http://localhost:3000/api/ingredients/${this.newIngredient.id}`, this.newIngredient)
        .subscribe({
          next: () => {
            alert('修正が完了しました！');
            this.isEditing = false;
            this.resetForm();
            this.loadIngredients();
          },
          error: (err) => console.error('更新エラー:', err)
        });
    } else {
      // 新規（POST）
      this.http.post('http://localhost:3000/api/ingredients', this.newIngredient)
        .subscribe({
          next: () => {
            alert('登録が完了しました！');
            this.resetForm();
            this.loadIngredients();
          },
          error: (err) => alert('登録エラー: 入力内容を確認してください。')
        });
    }
  }

  // フォーム初期化
  resetForm() {
    this.newIngredient = {
      id: null,
      code: '',
      name: '',
      category: '牛肉',
      purchase_price: 0,
      purchase_quantity: 0,
      unit: 'g',
      yield_rate: 100,
      allergens: ''
    };
    this.onInputChanged();
  }
}