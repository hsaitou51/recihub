import { Component } from '@angular/core';
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
  purchaseQuantity: number;
  purchasePrice: number;
  yieldRate: number;
  nutrition: NutritionData;
  additives: string;
  allergens: string[];
}

interface CategoryOption {
  code: string;
  name: string;
  parentCode?: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  categoryCounters: { [key: string]: number } = {};

  selectedCategoryCode = '';
  previewCode = 'RM-------';
  
  // 🔍 フリーワード検索用
  searchQuery = '';

  // 🔻 3段階連動分類検索用変数
  searchMajorCategory = '';
  searchMiddleCategory = '';
  searchDetailCategory = '';

  // 🥩 1段階目: 大分類データ
  majorCategories: CategoryOption[] = [
    { code: '1', name: '🥩 肉類' },
    { code: '2', name: '🐟 魚介類' },
    { code: '3', name: '🥬 野菜' },
    { code: '4', name: '🍎 果物' },
    { code: '5', name: '🥛 乳製品' },
    { code: '6', name: '🥚 卵類' },
    { code: '7', name: '🧂 調味料' },
    { code: '8', name: '🛢️ 油類' },
    { code: '9', name: '📦 グロッサリー' },
    { code: '10', name: '🍲 仕掛品' },
    { code: '11', name: '🧻 その他・資材包材' }
  ];

  // 🍖 2段階目: 中分類マスターデータ
  allMiddleCategories: CategoryOption[] = [
    // 肉類
    { code: '11', name: '牛肉', parentCode: '1' },
    { code: '12', name: '豚肉', parentCode: '1' },
    { code: '13', name: '鶏肉', parentCode: '1' },
    // 魚介類
    { code: '21', name: '鮮魚', parentCode: '2' },
    { code: '23', name: '貝・甲殻類', parentCode: '2' },
    { code: '25', name: 'イカ・タコ', parentCode: '2' },
    { code: '27', name: 'その他魚介', parentCode: '2' },
    { code: '29', name: '魚介加工品', parentCode: '2' },
    // 野菜
    { code: '31', name: '葉菜類', parentCode: '3' },
    { code: '33', name: '根菜類', parentCode: '3' },
    { code: '35', name: '果菜類', parentCode: '3' },
    { code: '37', name: 'ハーブ類', parentCode: '3' },
    { code: '38', name: 'その他野菜', parentCode: '3' },
    { code: '39', name: '野菜加工品', parentCode: '3' },
    // 果物
    { code: '41', name: '柑橘類', parentCode: '4' },
    { code: '43', name: 'リンゴ・モモ類', parentCode: '4' },
    { code: '45', name: 'その他フルーツ', parentCode: '4' },
    { code: '47', name: '果物加工品', parentCode: '4' },
    // 乳製品
    { code: '51', name: '牛乳・生クリーム', parentCode: '5' },
    { code: '52', name: '発酵乳', parentCode: '5' },
    { code: '53', name: '油脂・チーズ', parentCode: '5' },
    { code: '59', name: 'その他乳製品', parentCode: '5' },
    // 卵類
    { code: '61', name: '卵', parentCode: '6' },
    { code: '69', name: '卵加工品', parentCode: '6' },
    // 調味料
    { code: '71', name: '基礎調味料', parentCode: '7' },
    { code: '72', name: '複合調味料', parentCode: '7' },
    // 油類
    { code: '81', name: '植物油', parentCode: '8' },
    { code: '82', name: '動物油', parentCode: '8' },
    // グロッサリー
    { code: '91', name: '缶詰・瓶詰', parentCode: '9' },
    { code: '92', name: '乾物・穀類', parentCode: '9' },
    // 仕掛品
    { code: '101', name: 'ベース仕込', parentCode: '10' },
    { code: '102', name: '半製品', parentCode: '10' },
    // 資材包材
    { code: '111', name: '容器・包装', parentCode: '11' },
    { code: '112', name: '消耗品', parentCode: '11' }
  ];

  // 🥩 3段階目: 詳細分類マスターデータ（7桁のカテゴリコードにそのまま連動）
  allDetailCategories: CategoryOption[] = [
    { code: '1110000', name: '牛フィレ', parentCode: '11' },
    { code: '1130000', name: '牛ロース', parentCode: '11' },
    { code: '1140000', name: '牛バラ', parentCode: '11' },
    { code: '1150000', name: '牛モモ', parentCode: '11' },
    { code: '1160000', name: '牛その他(タン・ハツ等)', parentCode: '11' },
    { code: '1190000', name: '牛肉加工品', parentCode: '11' },
    { code: '1210000', name: '豚ロース', parentCode: '12' },
    { code: '1220000', name: '豚バラ', parentCode: '12' },
    { code: '1280000', name: '豚その他', parentCode: '12' },
    { code: '1290000', name: '豚加工品(ハム等)', parentCode: '12' },
    { code: '1310000', name: '鶏モモ', parentCode: '13' },
    { code: '1330000', name: '鶏ムネ', parentCode: '13' },
    { code: '1350000', name: '鶏その他(砂肝等)', parentCode: '13' },
    { code: '1370000', name: '鶏肉加工品', parentCode: '13' },
    { code: '2110000', name: '鮮魚全般', parentCode: '21' },
    { code: '2310000', name: 'エビ・カニ・貝', parentCode: '23' },
    { code: '2510000', name: 'イカ・タコ類', parentCode: '25' },
    { code: '2710000', name: 'その他魚介', parentCode: '27' },
    { code: '2910000', name: 'ツナ・すり身等', parentCode: '29' },
    { code: '3110000', name: 'キャベツ・レタス等', parentCode: '31' },
    { code: '3310000', name: '大根・人参等', parentCode: '33' },
    { code: '3510000', name: 'トマト・ナス等', parentCode: '35' },
    { code: '3710000', name: 'フレッシュハーブ', parentCode: '37' },
    { code: '3810000', name: 'その他野菜', parentCode: '38' },
    { code: '3910000', name: 'カット・ペースト等', parentCode: '39' },
    { code: '4110000', name: 'オレンジ・レモン等', parentCode: '41' },
    { code: '4310000', name: 'リンゴ・モモ等', parentCode: '43' },
    { code: '4510000', name: 'その他フルーツ', parentCode: '45' },
    { code: '4710000', name: 'ピューレ・缶詰等', parentCode: '47' },
    { code: '5110000', name: '牛乳・生クリーム', parentCode: '51' },
    { code: '5210000', name: 'ヨーグルト', parentCode: '52' },
    { code: '5310000', name: 'チーズ・バター', parentCode: '53' },
    { code: '5910000', name: 'その他乳製品', parentCode: '59' },
    { code: '6110000', name: '全卵・液卵', parentCode: '61' },
    { code: '6910000', name: 'その他・卵加工品', parentCode: '69' },
    { code: '7110000', name: '醤油・塩・砂糖等', parentCode: '71' },
    { code: '7210000', name: 'ソース・ドレッシング', parentCode: '72' },
    { code: '8110000', name: 'サラダ油・オリーブ油', parentCode: '81' },
    { code: '8210000', name: 'ラード・油脂加工品', parentCode: '82' },
    { code: '9110000', name: '缶詰・瓶詰製品', parentCode: '91' },
    { code: '9210000', name: 'パスタ・米・乾物', parentCode: '92' },
    { code: '10110000', name: '自社ソース・出汁', parentCode: '101' },
    { code: '10210000', name: '生地・パーツ仕込', parentCode: '102' },
    { code: '11110000', name: 'テイクアウト容器・パック', parentCode: '111' },
    { code: '11210000', name: '衛生・ラップ・手袋', parentCode: '112' }
  ];

  // 選択された大分類に応じて絞り込まれる中分類リスト
  get filteredMiddleCategories(): CategoryOption[] {
    if (!this.searchMajorCategory) return [];
    return this.allMiddleCategories.filter(item => item.parentCode === this.searchMajorCategory);
  }

  // 選択された中分類に応じて絞り込まれる詳細分類リスト
  get filteredDetailCategories(): CategoryOption[] {
    if (!this.searchMiddleCategory) return [];
    return this.allDetailCategories.filter(item => item.parentCode === this.searchMiddleCategory);
  }

  // 🔄 プルダウン変更時のクリア処理
  onSearchMajorChange() {
    this.searchMiddleCategory = '';
    this.searchDetailCategory = '';
  }

  onSearchMiddleChange() {
    this.searchDetailCategory = '';
  }

  // ✏️ 現在編集中のコード
  editingCode: string | null = null;

  rawMaterial = {
    name: '',
    unit: 'kg',
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

  get unitPrice(): number {
    if (!this.rawMaterial.purchaseQuantity || this.rawMaterial.purchaseQuantity <= 0) return 0;
    return (this.rawMaterial.purchasePrice || 0) / this.rawMaterial.purchaseQuantity;
  }

  // 🔍 検索ロジック (キーワード ＋ 3段階連動分類検索)
  get filteredSavedList(): SavedMaterial[] {
    return this.savedList.filter(item => {
      // 1. キーワード一致チェック
      const q = this.searchQuery.trim().toLowerCase();
      const matchesQuery = !q || (
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q) ||
        item.additives.toLowerCase().includes(q)
      );

      // 2. 3段階分類一致チェック
      let matchesCategory = true;

      // 詳細分類（7桁コード）が指定されている場合：完全一致
      if (this.searchDetailCategory) {
        matchesCategory = item.categoryCode === this.searchDetailCategory;
      } 
      // 中分類が指定されている場合：前方一致（例: 肉類・牛肉="11"）
      else if (this.searchMiddleCategory) {
        matchesCategory = item.categoryCode.startsWith(this.searchMiddleCategory);
      } 
      // 大分類が指定されている場合：前方一致（例: 肉類="1"）
      else if (this.searchMajorCategory) {
        matchesCategory = item.categoryCode.startsWith(this.searchMajorCategory);
      }

      return matchesQuery && matchesCategory;
    });
  }

  editMaterial(item: SavedMaterial) {
    this.editingCode = item.code;
    this.previewCode = item.code;
    this.selectedCategoryCode = item.categoryCode;

    this.rawMaterial = {
      name: item.name,
      unit: item.unit,
      purchaseQuantity: item.purchaseQuantity,
      purchasePrice: item.purchasePrice || 0,
      yieldRate: item.yieldRate,
      nutrition: { ...item.nutrition },
      additives: item.additives
    };

    this.mandatoryAllergens.forEach(a => a.selected = item.allergens.includes(a.name));
    this.recommendedAllergens.forEach(a => a.selected = item.allergens.includes(a.name));

    const formEl = document.getElementById('form-top');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  }

  cancelEdit() {
    this.resetForm();
  }

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

  onNameChange(name: string) {
    if (this.editingCode) return;

    if (!name) {
      this.selectedCategoryCode = '';
      this.previewCode = 'RM-------';
      return;
    }

    if (name.includes('牛') && name.includes('フィレ')) this.selectedCategoryCode = '1110000';
    else if (name.includes('牛') && name.includes('ロース')) this.selectedCategoryCode = '1130000';
    else if (name.includes('牛') && name.includes('バラ')) this.selectedCategoryCode = '1140000';
    else if (name.includes('牛') && (name.includes('タン') || name.includes('ハツ'))) this.selectedCategoryCode = '1160000';
    else if (name.includes('牛')) this.selectedCategoryCode = '1150000';
    else if (name.includes('豚') && name.includes('ロース')) this.selectedCategoryCode = '1210000';
    else if (name.includes('豚') && name.includes('バラ')) this.selectedCategoryCode = '1220000';
    else if (name.includes('豚') && (name.includes('ハム') || name.includes('ベーコン'))) this.selectedCategoryCode = '1290000';
    else if (name.includes('豚')) this.selectedCategoryCode = '1280000';
    else if (name.includes('鶏') && name.includes('ムネ')) this.selectedCategoryCode = '1330000';
    else if (name.includes('鶏') && name.includes('モモ')) this.selectedCategoryCode = '1310000';
    else if (name.includes('マグロ') || name.includes('サケ') || name.includes('魚')) this.selectedCategoryCode = '2110000';
    else if (name.includes('エビ') || name.includes('カニ') || name.includes('貝')) this.selectedCategoryCode = '2310000';
    else if (name.includes('イカ') || name.includes('タコ')) this.selectedCategoryCode = '2510000';
    else if (name.includes('キャベツ') || name.includes('レタス')) this.selectedCategoryCode = '3110000';
    else if (name.includes('大根') || name.includes('人参')) this.selectedCategoryCode = '3310000';
    else if (name.includes('トマト') || name.includes('ナス')) this.selectedCategoryCode = '3510000';
    else if (name.includes('オレンジ') || name.includes('レモン')) this.selectedCategoryCode = '4110000';
    else if (name.includes('リンゴ') || name.includes('モモ')) this.selectedCategoryCode = '4310000';
    else if (name.includes('牛乳') || name.includes('生クリーム')) this.selectedCategoryCode = '5110000';
    else if (name.includes('チーズ') || name.includes('バター')) this.selectedCategoryCode = '5310000';
    else if (name.includes('卵') || name.includes('たまご')) this.selectedCategoryCode = '6110000';
    else if (name.includes('醤油') || name.includes('塩') || name.includes('砂糖') || name.includes('味噌')) this.selectedCategoryCode = '7110000';
    else if (name.includes('サラダ油') || name.includes('オリーブオイル') || name.includes('油')) this.selectedCategoryCode = '8110000';

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
          purchaseQuantity: this.rawMaterial.purchaseQuantity,
          purchasePrice: this.rawMaterial.purchasePrice || 0,
          yieldRate: this.rawMaterial.yieldRate,
          nutrition: { ...this.rawMaterial.nutrition },
          additives: this.rawMaterial.additives,
          allergens: selectedAllergens
        };
        alert('変更を上書き更新しました！');
      }
    } else {
      this.savedList.push({
        code: this.previewCode,
        categoryCode: this.selectedCategoryCode,
        categoryName: this.getCategoryLabel(this.selectedCategoryCode),
        name: this.rawMaterial.name,
        unit: this.rawMaterial.unit,
        purchaseQuantity: this.rawMaterial.purchaseQuantity,
        purchasePrice: this.rawMaterial.purchasePrice || 0,
        yieldRate: this.rawMaterial.yieldRate,
        nutrition: { ...this.rawMaterial.nutrition },
        additives: this.rawMaterial.additives,
        allergens: selectedAllergens
      });

      this.categoryCounters[this.selectedCategoryCode] = (this.categoryCounters[this.selectedCategoryCode] || 1) + 1;
      alert('確定保存しました！');
    }

    this.sortSavedList();
    this.resetForm();
  }

  sortSavedList() {
    this.savedList.sort((a, b) => 
      a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' })
    );
  }

  resetForm() {
    this.editingCode = null;
    this.rawMaterial = {
      name: '',
      unit: 'kg',
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

  getCategoryLabel(code: string): string {
    const detail = this.allDetailCategories.find(d => d.code === code);
    if (!detail) return 'その他';

    const middle = this.allMiddleCategories.find(m => m.code === detail.parentCode);
    const major = this.majorCategories.find(mj => mj.code === middle?.parentCode);

    const majorName = major ? major.name.replace(/^[^\s]+\s*/, '') : '';
    const middleName = middle ? middle.name : '';
    const detailName = detail.name;

    return `${majorName} > ${middleName} > ${detailName}`;
  }
}