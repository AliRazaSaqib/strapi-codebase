const supabase = require("../../../../utils/supabase");

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    if (!result.supabaseId)
      await supabase
        .getSupbase()
        .from("leads")
        .insert([
          {
            title: result.title,
            description: result.description,
            strapi_id: result.id,
            created_at: result.createdAt,
            updated_at: result.updatedAt,
          },
        ]);
  },

  async afterUpdate(event) {
    const { result } = event;
    console.log(result);

    await supabase
      .getSupbase()
      .from("leads")
      .update({
        title: result.title,
        description: result.description,
        strapi_id: result.strapi_id,
        created_at: result.createdAt,
        updated_at: result.updatedAt,
      })
      .eq("strapi_id", result.id);
  },
  async afterDelete(event) {
    const { result } = event;
    await supabase
      .getSupbase()
      .from("leads")
      .delete()
      .eq("strapi_id", result.id);
  },
};
