const createClient = require("@supabase/supabase-js").createClient;

function getSupbaseData() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
}

const subscribeToChanges = (strapi) => {
  const knex = strapi.db.connection;
  getSupbaseData()
    .channel("contents")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "contents" },
      async (payload) => {
        const { title, description, created_at, id } = payload.new;
        if (!id) {
          const entry = await strapi.db.query("api::content.content").create({
            data: {
              title,
              description,
              id: id,
              created_at: created_at,
            },
          });
          const tt = await getSupbaseData()
            .from("contents")
            .update({
              id: entry.id,
            })
            .eq("id", id);
        } else {
          await knex("contents").where({ id: id }).update({
            id: id,
          });
        }
      }
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "contents" },
      async (payload) => {
        await knex("contents").where({ id: payload.new.id }).update({
          title: payload.new.title,
          description: payload.new.description,
          created_at: payload.new.created_at,
          id: payload.new.id,
        });
      }
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "contents" },
      async (payload) => {
        await knex("contents").where({ id: payload.old.id }).del();
      }
    )
    .subscribe();
};

module.exports = {
  getSupbaseData,
  subscribeToChanges,
};
