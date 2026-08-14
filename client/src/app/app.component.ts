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
  categoryName: string;
  name: string;
  unit: string;
  purchaseQuantity: number;
  yieldRate: number;
  nutrition: NutritionData;
  additives: string;
  allergens: string[];
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

  rawMaterial = {
    name: '',
    unit: 'g',
    purchaseQuantity: 1000,
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

  // 特定原材料 9品目
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

  // 特定原材料に準ずるもの 20品目
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
    if (!name) {
      this.selectedCategoryCode = '';
      this.previewCode = 'RM-------';
      return;
    }

    // 自動推測ロジック（最新分類コードに対応）
    if (name.includes('牛') && name.includes('ロース')) this.selectedCategoryCode = '1110000';
    else if (name.includes('牛') && name.includes('バラ')) this.selectedCategoryCode = '1120000';
    else if (name.includes('牛') && (name.includes('タン') || name.includes('ハツ'))) this.selectedCategoryCode = '1180000';
    else if (name.includes('牛')) this.selectedCategoryCode = '1130000';
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
    this.updatePreviewCode();
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

    this.savedList.push({
      code: this.previewCode,
      categoryName: this.getCategoryLabel(this.selectedCategoryCode),
      name: this.rawMaterial.name,
      unit: this.rawMaterial.unit,
      purchaseQuantity: this.rawMaterial.purchaseQuantity,
      yieldRate: this.rawMaterial.yieldRate,
      nutrition: { ...this.rawMaterial.nutrition },
      additives: this.rawMaterial.additives,
      allergens: selectedAllergens
    });

    this.categoryCounters[this.selectedCategoryCode] = (this.categoryCounters[this.selectedCategoryCode] || 1) + 1;

    // フォームリセット
    this.rawMaterial.name = '';
    this.selectedCategoryCode = '';
    this.previewCode = 'RM-------';
    this.rawMaterial.nutrition = { calories: null, protein: null, fat: null, carbs: null, salt: null };
    this.rawMaterial.additives = '';
    this.mandatoryAllergens.forEach(a => a.selected = false);
    this.recommendedAllergens.forEach(a => a.selected = false);

    alert('確定保存しました！');
  }

  getCategoryLabel(code: string): string {
    const labels: { [key: string]: string } = {
      '1110000': '肉類 > 牛肉 > ロース',
      '1120000': '肉類 > 牛肉 > バラ',
      '1130000': '肉類 > 牛肉 > モモ',
      '1180000': '肉類 > 牛肉 > その他(タン・ハツ等)',
      '1190000': '肉類 > 牛肉 > 加工品',
      '1210000': '肉類 > 豚肉 > ロース',
      '1220000': '肉類 > 豚肉 > バラ',
      '1280000': '肉類 > 豚肉 > その他',
      '1290000': '肉類 > 豚肉 > 加工品(ハム等)',
      '1310000': '肉類 > 鶏肉 > モモ',
      '1330000': '肉類 > 鶏肉 > ムネ',
      '1350000': '肉類 > 鶏肉 > その他(砂肝等)',
      '1370000': '肉類 > 鶏肉 > 加工品',
      '2110000': '魚介類 > 鮮魚',
      '2310000': '魚介類 > 甲殻類・貝類',
      '2510000': '魚介類 > イカ・タコ',
      '2710000': '魚介類 > その他',
      '2910000': '魚介類 > 加工品(ツナ・すり身等)',
      '3110000': '野菜 > 葉菜類',
      '3310000': '野菜 > 根菜類',
      '3510000': '野菜 > 果菜類(トマト・ナス等)',
      '3710000': '野菜 > ハーブ類',
      '3810000': '野菜 > その他',
      '3910000': '野菜 > 加工品(カット・ペースト等)',
      '4110000': '果物 > 柑橘類',
      '4310000': '果物 > リンゴ・モモ類',
      '4510000': '果物 > その他',
      '4710000': '果物 > 加工品(ピューレ・缶詰等)',
      '5110000': '乳製品 > 牛乳・生クリーム',
      '5210000': '乳製品 > ヨーグルト',
      '5310000': '乳製品 > チーズ・バター',
      '5910000': '乳製品 > その他',
      '6110000': '卵類 > 全卵・液卵',
      '6910000': '卵類 > その他・加工品',
      '7110000': '調味料 > 基礎調味料(醤油・塩等)',
      '7210000': '調味料 > 複合調味料・ソース',
      '8110000': '油類 > 植物油',
      '8210000': '油類 > 動物油・油脂加工品',
      '9110000': 'グロッサリー > 缶詰・瓶詰',
      '9210000': 'グロッサリー > 乾物・穀類・麺類',
      '10110000': '仕掛品 > 自社ソース・ベース',
      '10210000': '仕掛品 > 半製品生地',
      '11110000': 'その他・資材包材 > 容器・パック',
      '11210000': 'その他・資材包材 > 衛生・消耗品'
    };
    return labels[code] || 'その他';
  }
}