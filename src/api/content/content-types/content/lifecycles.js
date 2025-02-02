const supabase = require("../../../../utils/supabase");

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    console.log("new item: " + JSON.stringify(result));
    if (!result.supabaseId) {
      // Check if entry already exists
      const { data: existingData, error: fetchError } = await supabase
        .getSupbase()
        .from("contents")
        .select("id")
        .eq("id", result.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Supabase Fetch Error:", fetchError);
        return;
      }

      // Insert or update using UPSERT to prevent duplication
      const { data, error } = await supabase
        .getSupbase()
        .from("contents")
        .upsert(
          [
            {
              id: result.id,
              title: result.title,
              description: result.description,
              document_id: result.document_id || null,
              created_at: result.createdAt,
              updated_at: result.updatedAt,
            },
          ],
          { onConflict: ["id"] } // Ensures no duplicate IDs
        )
        .select();

      if (error) {
        console.error("Supabase Upsert Error:", error);
      } else {
        console.log("Upserted data:", data);
      }
    }
  },

  async afterUpdate(event) {
    const { result } = event;

    console.log("Updating data", result);

    const { data, error } = await supabase
      .getSupbase()
      .from("contents")
      .update({
        title: result.title,
        description: result.description,
        document_id: result.document_id || null, // Ensure this is included
        created_at: result.createdAt,
        updated_at: result.updatedAt,
      })
      .eq("id", result.id);

    if (error) console.error("Supabase Update Error:", error);
    console.log("Updated data:", data);
  },

  async afterDelete(event) {
    const { result } = event;
    const { error } = await supabase
      .getSupbase()
      .from("contents")
      .delete()
      .eq("id", result.id);

    if (error) console.error("Supabase Delete Error:", error);
  },
};
