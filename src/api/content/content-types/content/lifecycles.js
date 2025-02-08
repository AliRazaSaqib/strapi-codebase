const supabase = require("../../../../utils/supabase");

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    if (!result.publishedAt && !result.supabaseId) {
      return;
    } else {
      await supabase
        .getSupbaseData()
        .from("contents")
        .insert([
          {
            title: result.title,
            description: result.description,
            id: result.id - 1,
            created_at: result.createdAt,
          },
        ]);
    }
  },

  async afterUpdate(event) {
    const { result } = event;

    const { error } = await supabase
      .getSupbaseData()
      .from("contents")
      .update({
        title: result.title,
        description: result.description,
        created_at: result.createdAt,
      })
      .eq("id", result.id);
    if (error) console.error("Supabase Update Error:", error);
  },

  async afterDelete(event) {
    const { result } = event;
    const { error } = await supabase
      .getSupbaseData()
      .from("contents")
      .delete()
      .eq("id", result.id);

    if (error) console.error("Supabase Delete Error:", error);
  },
};
