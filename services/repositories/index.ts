export { createInMemoryLocalRepositories } from "./inMemoryLocalRepositories";
import { createSqliteLocalRepositories } from "./sqliteLocalRepositories";

export const localRepositories = createSqliteLocalRepositories();
