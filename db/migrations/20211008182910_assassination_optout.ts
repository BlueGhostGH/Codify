import Knex from "knex";

export const up = async (knex: Knex) => {
    return knex.schema.table("user", table => {
        table.boolean("assassin").defaultTo(true);
    });
};

export const down = async (knex: Knex) => {
    return knex.schema.table("user", table => {
        return table.dropColumn("assassin");
    });
};
