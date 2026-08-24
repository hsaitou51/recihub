import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AllergenItem {
  id: string;
  name: string;
  icon: string;
  selected: boolean;
}

interface NutritionData {
  calories: number | null;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
  salt: number | null;
}

interface SavedMaterial {
  code: string;
  categoryCode: string;
  categoryName: string;
  name: string;
  unit: string;
  contentQuantity: number;
  contentUnit: string;
  purchaseQuantity: number;
  purchasePrice: number;
  yieldRate: number;
  nutrition: NutritionData;
  additives: string;
  allergens: string[];
}

interface RecipeItem {
  materialCode: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  cost: number;
}

interface SavedRecipe {
  code: string;
  name: string;
  category: string;
  yieldPortion: number;
  yieldQuantity: number;
  yieldUnit: string;
  processNotes: string;
  sellingPrice: number;
  items: RecipeItem[];
  totalCost: number;
  unitCost: number;
  costRate: number;
  nutrition: NutritionData;
  allergens: string[];
  notes: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // 🌟 修正：'dashboard' を追加して型エラーを解消します
  activeTab: 'dashboard' | 'material' | 'recipe' = 'dashboard';
  
  categoryCounters: { [key: string]: number } = {};

  selectedCategoryCode = '';
  previewCode = 'RM-------';

  searchQuery = '';
  searchMajorCategory = '';
  searchMiddleCategory = '';
  searchDetailCategory = '';

  majorCategories = [
    { code: '1', name: '1. 肉類' },
    { code: '2', name: '2. 魚介類' },
    { code: '3', name: '3. 野菜' },
    { code: '4', name: '4. 果物' },
    { code: '5', name: '5. 乳製品' },
    { code: '6', name: '6. 卵類' },
    { code: '7', name: '7. 調味料' },
    { code: '8', name: '8. 油類' },
    { code: '9', name: '9. グロッサリー' },
    { code: '10', name: '10. 仕掛品' },
    { code: '11', name: '11. その他・資材包材' }
  ];

  middleCategoriesMap: { [key: string]: { code: string; name: string }[] } = {
    '1': [
      { code: '11', name: '牛肉' },
      { code: '12', name: '豚肉' },
      { code: '13', name: '鶏肉' }
    ],
    '2': [
      { code: '21', name: '鮮魚' },
      { code: '23', name: '貝・甲殻類' },
      { code: '25', name: 'イカ・タコ' },
      { code: '27', name: 'その他魚介' },
      { code: '29', name: '加工品' }
    ],
    '3': [
      { code: '31', name: '葉菜類' },
      { code: '33', name: '根菜類' },
      { code: '35', name: '果菜類' },
      { code: '37', name: 'ハーブ類' },
      { code: '38', name: 'その他野菜' },
      { code: '39', name: '加工品' }
    ],
    '4': [
      { code: '41', name: '柑橘類' },
      { code: '43', name: 'リンゴ・モモ類' },
      { code: '45', name: 'その他フルーツ' },
      { code: '47', name: '加工品' }
    ],
    '5': [
      { code: '51', name: '牛乳・生クリーム' },
      { code: '52', name: '発酵乳' },
      { code: '53', name: '油脂・チーズ' },
      { code: '59', name: 'その他乳製品' }
    ],
    '6': [
      { code: '61', name: '卵' },
      { code: '69', name: '加工品' }
    ],
    '7': [
      { code: '71', name: '基礎調味料' },
      { code: '72', name: '複合調味料' }
    ],
    '8': [
      { code: '81', name: '植物油' },
      { code: '82', name: '動物油' }
    ],
    '9': [
      { code: '91', name: '缶詰・瓶詰' },
      { code: '92', name: '乾物・穀類' }
    ],
    '10': [
      { code: '101', name: 'ベース仕込' },
      { code: '102', name: '半製品' }
    ],
    '11': [
      { code: '111', name: '容器・包装' },
      { code: '112', name: '消耗品' }
    ]
  };

  filteredMiddleCategories: { code: string; name: string }[] = [];
  filteredDetailCategories: { code: string; name: string }[] = [];

  editingCode: string | null = null;

  rawMaterial = {
    name: '',
    unit: 'kg',
    contentQuantity: 1000,
    contentUnit: 'g',
    purchaseQuantity: 1,
    purchasePrice: 0,
    yieldRate: 100,
    nutrition: {
      calories: null as number | null,
      protein: null as number | null,
      fat: null as number | null,
      carbs: null as number | null,
      salt: null as number | null
    },
    additives: ''
  };

  savedList: SavedMaterial[] = [];

  recipe = {
    name: '',
    category: '料理・メイン',
    yieldPortion: 1,
    yieldQuantity: 100,
    yieldUnit: 'g',
    processNotes: '',
    sellingPrice: 0,
    notes: ''
  };

  selectedMaterialCodeForRecipe = '';
  recipeInputQuantity = 100;
  recipeInputUnit = 'g';
  recipeItems: RecipeItem[] = [];
  savedRecipes: SavedRecipe[] = [];
  editingRecipeCode: string | null = null;

  mandatoryAllergens: AllergenItem[] = [
    { id: 'egg', name: '卵', icon: '🥚', selected: false },
    { id: 'milk', name: '乳', icon: '🥛', selected: false },
    { id: 'wheat', name: '小麦', icon: '🌾', selected: false },
    { id: 'soba', name: 'そば', icon: '🍜', selected: false },
    { id: 'walnut', name: 'クルミ', icon: '🥜', selected: false },
    { id: 'peanut', name: '落花生（ピーナッツ）', icon: '🥜', selected: false },
    { id: 'cashew', name: 'カシューナッツ', icon: '🌰', selected: false },
    { id: 'shrimp', name: 'エビ', icon: '🦐', selected: false },
    { id: 'crab', name: 'カニ', icon: '🦀', selected: false }
  ];

  recommendedAllergens: AllergenItem[] = [
    { id: 'beef', name: '牛肉', icon: '🥩', selected: false },
    { id: 'pork', name: '豚肉', icon: '🐖', selected: false },
    { id: 'chicken', name: '鶏肉', icon: '🍗', selected: false },
    { id: 'salmon', name: 'サケ', icon: '🐟', selected: false },
    { id: 'mackerel', name: 'サバ', icon: '🐟', selected: false },
    { id: 'squid', name: 'イカ', icon: '🦑', selected: false },
    { id: 'salmon_roe', name: 'イクラ', icon: '🔴', selected: false },
    { id: 'abalone', name: 'アワビ', icon: '🦪', selected: false },
    { id: 'soy', name: '大豆', icon: '🫘', selected: false },
    { id: 'sesame', name: 'ゴマ', icon: '🫘', selected: false },
    { id: 'almond', name: 'アーモンド', icon: '🌰', selected: false },
    { id: 'pistachio', name: 'ピスタチオ', icon: '🫛', selected: false },
    { id: 'macadamia', name: 'マカダミアナッツ', icon: '🌰', selected: false },
    { id: 'yam', name: '山芋', icon: '🍠', selected: false },
    { id: 'apple', name: 'リンゴ', icon: '🍎', selected: false },
    { id: 'orange', name: 'オレンジ', icon: '🍊', selected: false },
    { id: 'kiwi', name: 'キウイ', icon: '🥝', selected: false },
    { id: 'banana', name: 'バナナ', icon: '🍌', selected: false },
    { id: 'peach', name: 'モモ', icon: '🍑', selected: false },
    { id: 'gelatin', name: 'ゼラチン', icon: '🧪', selected: false }
  ];

  ngOnInit() {
    const saved = localStorage.getItem('kitchenCore_savedList');
    if (saved) {
      try {
        this.savedList = JSON.parse(saved);
        this.sortSavedList();
      } catch (e) {
        console.error('保存データの読み込みに失敗しました', e);
      }
    }

    const counters = localStorage.getItem('kitchenCore_counters');
    if (counters) {
      try {
        this.categoryCounters = JSON.parse(counters);
      } catch (e) {
        console.error('カウンターデータの読み込みに失敗しました', e);
      }
    }

    const savedRecipes = localStorage.getItem('kitchenCore_savedRecipes');
    if (savedRecipes) {
      try {
        this.savedRecipes = JSON.parse(savedRecipes);
      } catch (e) {
        console.error('レシピデータの読み込みに失敗しました', e);
      }
    }
  }

  private saveToLocalStorage() {
    localStorage.setItem('kitchenCore_savedList', JSON.stringify(this.savedList));
    localStorage.setItem('kitchenCore_counters', JSON.stringify(this.categoryCounters));
  }

  private saveRecipesToLocalStorage() {
    localStorage.setItem('kitchenCore_savedRecipes', JSON.stringify(this.savedRecipes));
  }

  sortSavedList() {
    this.savedList.sort((a, b) => 
      a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' })
    );
  }

  get unitPrice(): number {
    const totalContent = (this.rawMaterial.purchaseQuantity || 0) * (this.rawMaterial.contentQuantity || 0);
    if (totalContent <= 0) return 0;
    return this.rawMaterial.purchasePrice / totalContent;
  }

  get filteredSavedList(): SavedMaterial[] {
    return this.savedList.filter(item => {
      const q = this.searchQuery.trim().toLowerCase();
      const matchesQuery = !q || (
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q) ||
        item.additives.toLowerCase().includes(q)
      );

      let matchesCategory = true;
      if (this.searchDetailCategory) {
        matchesCategory = item.categoryCode === this.searchDetailCategory;
      } else if (this.searchMiddleCategory) {
        matchesCategory = item.categoryCode.startsWith(this.searchMiddleCategory);
      } else if (this.searchMajorCategory) {
        matchesCategory = item.categoryCode.startsWith(this.searchMajorCategory);
      }

      return matchesQuery && matchesCategory;
    });
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchMajorCategory = '';
    this.searchMiddleCategory = '';
    this.searchDetailCategory = '';
    this.filteredMiddleCategories = [];
    this.filteredDetailCategories = [];
  }

  onSearchMajorChange() {
    this.searchMiddleCategory = '';
    this.searchDetailCategory = '';
    this.filteredDetailCategories = [];
    if (this.searchMajorCategory) {
      this.filteredMiddleCategories = this.middleCategoriesMap[this.searchMajorCategory] || [];
    } else {
      this.filteredMiddleCategories = [];
    }
  }

  onSearchMiddleChange() {
    this.searchDetailCategory = '';
    this.filteredDetailCategories = [];
  }

  onNameChange(name: string) {
    if (this.editingCode) return;
    if (!name) {
      this.selectedCategoryCode = '';
      this.previewCode = 'RM-------';
      return;
    }

    if (name.includes('牛') && name.includes('ロース')) this.selectedCategoryCode = '1130000';
    else if (name.includes('牛') && name.includes('フィレ')) this.selectedCategoryCode = '1110000';
    else if (name.includes('牛') && name.includes('バラ')) this.selectedCategoryCode = '1140000';
    else if (name.includes('牛') && name.includes('モモ')) this.selectedCategoryCode = '1150000';
    else if (name.includes('牛')) this.selectedCategoryCode = '1160000';
    else if (name.includes('豚') && name.includes('ロース')) this.selectedCategoryCode = '1210000';
    else if (name.includes('豚') && name.includes('バラ')) this.selectedCategoryCode = '1220000';
    else if (name.includes('豚')) this.selectedCategoryCode = '1280000';
    else if (name.includes('鶏') || name.includes('チキン')) this.selectedCategoryCode = '1310000';
    else if (name.includes('キャベツ') || name.includes('レタス')) this.selectedCategoryCode = '3110000';
    else if (name.includes('大根') || name.includes('人参')) this.selectedCategoryCode = '3310000';
    else if (name.includes('卵') || name.includes('たまご')) this.selectedCategoryCode = '6110000';
    else if (name.includes('醤油') || name.includes('塩') || name.includes('砂糖')) this.selectedCategoryCode = '7110000';

    this.updatePreviewCode();
  }

  onCategoryChange() {
    if (!this.editingCode) {
      this.updatePreviewCode();
    }
  }

  updatePreviewCode() {
    if (!this.selectedCategoryCode) {
      this.previewCode = 'RM-------';
      return;
    }
    const baseCode = parseInt(this.selectedCategoryCode, 10);
    const seq = this.categoryCounters[this.selectedCategoryCode] || 1;
    this.previewCode = 'RM' + (baseCode + seq);
  }

  editMaterial(item: SavedMaterial) {
    this.editingCode = item.code;
    this.previewCode = item.code;
    this.selectedCategoryCode = item.categoryCode;

    this.rawMaterial = {
      name: item.name,
      unit: item.unit,
      contentQuantity: item.contentQuantity ?? 1,
      contentUnit: item.contentUnit ?? 'g',
      purchaseQuantity: item.purchaseQuantity,
      purchasePrice: item.purchasePrice,
      yieldRate: item.yieldRate,
      nutrition: { ...item.nutrition },
      additives: item.additives
    };

    this.mandatoryAllergens.forEach(a => a.selected = item.allergens.includes(a.name));
    this.recommendedAllergens.forEach(a => a.selected = item.allergens.includes(a.name));

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.resetForm();
  }

  saveRawMaterial() {
    if (!this.rawMaterial.name) {
      alert('原材料名を入力してください！');
      return;
    }
    if (!this.selectedCategoryCode) {
      alert('分類を選択してください！');
      return;
    }

    const selectedAllergens = [
      ...this.mandatoryAllergens.filter(a => a.selected).map(a => a.name),
      ...this.recommendedAllergens.filter(a => a.selected).map(a => a.name)
    ];

    if (this.editingCode) {
      const index = this.savedList.findIndex(item => item.code === this.editingCode);
      if (index !== -1) {
        this.savedList[index] = {
          code: this.editingCode,
          categoryCode: this.selectedCategoryCode,
          categoryName: this.getCategoryLabel(this.selectedCategoryCode),
          name: this.rawMaterial.name,
          unit: this.rawMaterial.unit,
          contentQuantity: this.rawMaterial.contentQuantity,
          contentUnit: this.rawMaterial.contentUnit,
          purchaseQuantity: this.rawMaterial.purchaseQuantity,
          purchasePrice: this.rawMaterial.purchasePrice,
          yieldRate: this.rawMaterial.yieldRate,
          nutrition: { ...this.rawMaterial.nutrition },
          additives: this.rawMaterial.additives,
          allergens: selectedAllergens
        };
        this.saveToLocalStorage();
        alert('変更内容を更新保存しました！');
      }
    } else {
      this.savedList.push({
        code: this.previewCode,
        categoryCode: this.selectedCategoryCode,
        categoryName: this.getCategoryLabel(this.selectedCategoryCode),
        name: this.rawMaterial.name,
        unit: this.rawMaterial.unit,
        contentQuantity: this.rawMaterial.contentQuantity,
        contentUnit: this.rawMaterial.contentUnit,
        purchaseQuantity: this.rawMaterial.purchaseQuantity,
        purchasePrice: this.rawMaterial.purchasePrice,
        yieldRate: this.rawMaterial.yieldRate,
        nutrition: { ...this.rawMaterial.nutrition },
        additives: this.rawMaterial.additives,
        allergens: selectedAllergens
      });

      this.categoryCounters[this.selectedCategoryCode] = (this.categoryCounters[this.selectedCategoryCode] || 1) + 1;
      this.saveToLocalStorage();
      alert('マスタに保存しました！');
    }

    this.sortSavedList();
    this.resetForm();
  }

  resetForm() {
    this.editingCode = null;
    this.rawMaterial = {
      name: '',
      unit: 'kg',
      contentQuantity: 1000,
      contentUnit: 'g',
      purchaseQuantity: 1,
      purchasePrice: 0,
      yieldRate: 100,
      nutrition: { calories: null, protein: null, fat: null, carbs: null, salt: null },
      additives: ''
    };
    this.selectedCategoryCode = '';
    this.previewCode = 'RM-------';
    this.mandatoryAllergens.forEach(a => a.selected = false);
    this.recommendedAllergens.forEach(a => a.selected = false);
  }

  addMaterialToRecipe() {
    if (!this.selectedMaterialCodeForRecipe) {
      alert('追加する原材料を選択してください！');
      return;
    }
    if (this.recipeInputQuantity <= 0) {
      alert('使用量は0より大きい値を入力してください！');
      return;
    }

    const mat = this.savedList.find(m => m.code === this.selectedMaterialCodeForRecipe);
    if (!mat) return;

    let multiplier = 1;
    if (this.recipeInputUnit === 'kg' && mat.contentUnit === 'g') multiplier = 1000;
    else if (this.recipeInputUnit === 'g' && mat.contentUnit === 'kg') multiplier = 0.001;
    else if (this.recipeInputUnit === 'L' && mat.contentUnit === 'ml') multiplier = 1000;
    else if (this.recipeInputUnit === 'ml' && mat.contentUnit === 'L') multiplier = 0.001;

    const effectiveQuantity = this.recipeInputQuantity * multiplier;

    const totalContent = (mat.purchaseQuantity || 0) * (mat.contentQuantity || 0);
    const uPrice = (totalContent > 0) ? mat.purchasePrice / totalContent : 0;
    const subCost = uPrice * effectiveQuantity;

    const existing = this.recipeItems.find(i => i.materialCode === mat.code);
    if (existing) {
      existing.quantity += effectiveQuantity;
      existing.cost = existing.quantity * existing.unitPrice;
    } else {
      this.recipeItems.push({
        materialCode: mat.code,
        name: mat.name,
        unit: mat.contentUnit,
        quantity: effectiveQuantity,
        unitPrice: uPrice,
        cost: subCost
      });
    }

    this.selectedMaterialCodeForRecipe = '';
    this.recipeInputQuantity = 100;
    this.recipeInputUnit = 'g';
  }

  removeRecipeItem(index: number) {
    this.recipeItems.splice(index, 1);
  }

  get recipeTotalCost(): number {
    return this.recipeItems.reduce((sum, item) => sum + item.cost, 0);
  }

  get recipeUnitCost(): number {
    if (!this.recipe.yieldQuantity || this.recipe.yieldQuantity <= 0) return 0;
    return this.recipeTotalCost / this.recipe.yieldQuantity;
  }

  get recipeCostRate(): number {
    if (!this.recipe.sellingPrice || this.recipe.sellingPrice <= 0) return 0;
    return (this.recipeTotalCost / this.recipe.sellingPrice) * 100;
  }

  editRecipe(rec: SavedRecipe) {
    this.editingRecipeCode = rec.code;
    this.recipe = {
      name: rec.name,
      category: rec.category,
      yieldPortion: rec.yieldPortion,
      yieldQuantity: rec.yieldQuantity,
      yieldUnit: rec.yieldUnit,
      processNotes: rec.processNotes,
      sellingPrice: rec.sellingPrice,
      notes: rec.notes
    };
    this.recipeItems = [...rec.items.map(item => ({ ...item }))];
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelRecipeEdit() {
    this.resetRecipeForm();
  }

  saveRecipe() {
    if (!this.recipe.name) {
      alert('メニュー名（仕掛品名）を入力してください！');
      return;
    }
    if (this.recipeItems.length === 0) {
      alert('原材料が1つも追加されていません！');
      return;
    }

    const allergenSet = new Set<string>();
    let totalCal = 0;
    let totalPro = 0;
    let totalFat = 0;
    let totalCarbs = 0;
    let totalSalt = 0;

    this.recipeItems.forEach(item => {
      const mat = this.savedList.find(m => m.code === item.materialCode);
      if (mat) {
        mat.allergens.forEach(a => allergenSet.add(a));

        const ratio = item.quantity / 100;
        totalCal += (mat.nutrition.calories || 0) * ratio;
        totalPro += (mat.nutrition.protein || 0) * ratio;
        totalFat += (mat.nutrition.fat || 0) * ratio;
        totalCarbs += (mat.nutrition.carbs || 0) * ratio;
        totalSalt += (mat.nutrition.salt || 0) * ratio;
      }
    });

    const totalInputQty = this.recipeItems.reduce((sum, i) => sum + i.quantity, 0);
    const yieldQty = this.recipe.yieldQuantity || totalInputQty || 1;
    const factor = totalInputQty / yieldQty;

    const newRecipeCode = this.editingRecipeCode || ('REC' + Date.now().toString().slice(-4));

    const recipeData: SavedRecipe = {
      code: newRecipeCode,
      name: this.recipe.name,
      category: this.recipe.category,
      yieldPortion: this.recipe.yieldPortion,
      yieldQuantity: this.recipe.yieldQuantity,
      yieldUnit: this.recipe.yieldUnit,
      processNotes: this.recipe.processNotes,
      sellingPrice: this.recipe.sellingPrice,
      items: [...this.recipeItems],
      totalCost: this.recipeTotalCost,
      unitCost: this.recipeUnitCost,
      costRate: this.recipeCostRate,
      nutrition: {
        calories: Math.round(totalCal * factor),
        protein: Math.round(totalPro * factor * 10) / 10,
        fat: Math.round(totalFat * factor * 10) / 10,
        carbs: Math.round(totalCarbs * factor * 10) / 10,
        salt: Math.round(totalSalt * factor * 100) / 100
      },
      allergens: Array.from(allergenSet),
      notes: this.recipe.notes
    };

    if (this.editingRecipeCode) {
      const idx = this.savedRecipes.findIndex(r => r.code === this.editingRecipeCode);
      if (idx !== -1) {
        this.savedRecipes[idx] = recipeData;
      }
      alert('レシピを更新しました！');
    } else {
      this.savedRecipes.push(recipeData);
      alert('レシピを新規保存しました！');
    }

    this.saveRecipesToLocalStorage();

    const materialCategoryCode = '10210000';
    const existingMaterialIndex = this.savedList.findIndex(m => m.name === this.recipe.name || m.code === recipeData.code);
    const calculatedUnitCost = this.recipeUnitCost;

    if (existingMaterialIndex !== -1) {
      this.savedList[existingMaterialIndex] = {
        ...this.savedList[existingMaterialIndex],
        categoryCode: materialCategoryCode,
        categoryName: '仕掛品 > 半製品',
        name: this.recipe.name,
        unit: this.recipe.yieldUnit,
        contentQuantity: 1,
        contentUnit: this.recipe.yieldUnit,
        purchaseQuantity: 1,
        purchasePrice: calculatedUnitCost,
        yieldRate: 100,
        nutrition: recipeData.nutrition,
        additives: '',
        allergens: recipeData.allergens
      };
    } else {
      const matCode = 'RM' + (parseInt(materialCategoryCode, 10) + (this.categoryCounters[materialCategoryCode] || 1));
      this.categoryCounters[materialCategoryCode] = (this.categoryCounters[materialCategoryCode] || 1) + 1;

      this.savedList.push({
        code: matCode,
        categoryCode: materialCategoryCode,
        categoryName: '仕掛品 > 半製品',
        name: this.recipe.name,
        unit: this.recipe.yieldUnit,
        contentQuantity: 1,
        contentUnit: this.recipe.yieldUnit,
        purchaseQuantity: 1,
        purchasePrice: calculatedUnitCost,
        yieldRate: 100,
        nutrition: recipeData.nutrition,
        additives: '',
        allergens: recipeData.allergens
      });
    }
    this.saveToLocalStorage();
    this.sortSavedList();

    this.resetRecipeForm();
  }

  resetRecipeForm() {
    this.editingRecipeCode = null;
    this.recipe = {
      name: '',
      category: '料理・メイン',
      yieldPortion: 1,
      yieldQuantity: 100,
      yieldUnit: 'g',
      processNotes: '',
      sellingPrice: 0,
      notes: ''
    };
    this.recipeItems = [];
  }

  getCategoryLabel(code: string): string {
    const labels: { [key: string]: string } = {
      '1110000': '肉類 > 牛肉 > フィレ',
      '1130000': '肉類 > 牛肉 > ロース',
      '1140000': '肉類 > 牛肉 > バラ',
      '1150000': '肉類 > 牛肉 > モモ',
      '1160000': '肉類 > 牛肉 > その他',
      '1210000': '肉類 > 豚肉 > ロース',
      '1220000': '肉類 > 豚肉 > バラ',
      '1280000': '肉類 > 豚肉 > その他',
      '1310000': '肉類 > 鶏肉 > モモ',
      '3110000': '野菜 > 葉菜類',
      '3310000': '野菜 > 根菜類',
      '3510000': '野菜 > 果菜類',
      '6110000': '卵類 > 卵',
      '7110000': '調味料 > 基礎調味料',
      '10110000': '仕掛品 > ベース仕込',
      '10210000': '仕掛品 > 半製品'
    };
    return labels[code] || 'その他';
  }
}