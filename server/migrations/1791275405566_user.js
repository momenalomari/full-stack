/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
import { readFileSync } from "node:fs";

export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.sql(readFileSync(new URL("../src/schema.sql", import.meta.url), "utf8"));
    pgm.addColumn('users', {
        PHnum: { type: 'varchar(15)', notNull: true, default: true },
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropColumn('users', 'PHnum');
};
