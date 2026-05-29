REVOKE ALL ON FUNCTION "public"."increment_lom_post_view"(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."increment_lom_post_view"(text) FROM "anon";
REVOKE ALL ON FUNCTION "public"."increment_lom_post_view"(text) FROM "authenticated";
GRANT EXECUTE ON FUNCTION "public"."increment_lom_post_view"(text) TO "service_role";
