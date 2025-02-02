const createClient = require("@supabase/supabase-js").createClient;

const SUPABASE_URL = "https://erpnglqoidgdrnfdhodt.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycG5nbHFvaWRnZHJuZmRob2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzOTc4NDgsImV4cCI6MjA1Mzk3Mzg0OH0.5maIaK2CNhK-P1OhkdDmw0lq-oPRKIWK1YGP1F2ir24";

function getSupbase() {
  const client = createClient(SUPABASE_URL, SUPABASE_KEY);
  return client;
}

const subscribeToChanges = (strapi) => {
  const knex = strapi.db.connection;
  console.log(
    "knex subscribeToChanges",
    knex,
    "Connection",
    strapi.db.connection
  );
  getSupbase()
    .channel("contents")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "contents" },
      async (payload) => {
        console.log("created new :", payload);
        const { title, description, created_at, updated_at, id } = payload.new;
        if (!id) {
          const entry = await strapi.db.query("api::content.content").create({
            data: {
              title,
              description,
              id: id,
              createdAt: created_at,
              updatedAt: updated_at,
            },
          });
          console.log("entry :", entry);
          await getSupbase()
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
        console.log("payload :", payload);

        await knex("contents").where({ id: payload.new.id }).update({
          title: payload.new.title,
          description: payload.new.description,
          created_at: payload.new.created_at,
          updated_at: payload.new.updated_at,
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
  getSupbase,
  subscribeToChanges,
};
