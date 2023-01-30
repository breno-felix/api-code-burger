module.exports = class LoadAllCategoryRepository {
  constructor(categoryModel) {
    this.categoryModel = categoryModel
  }

  async load() {
    const categories = await this.categoryModel.find()
    return categories
  }
}
