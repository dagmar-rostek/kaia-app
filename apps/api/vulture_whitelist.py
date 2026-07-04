# Vulture whitelist — intentionally "unused" names that are in fact required
# by framework conventions or external contracts.
#
# Pydantic @field_validator and @model_validator methods receive `cls` as first
# parameter by Python's classmethod protocol — vulture sees it as unused because
# it is never referenced in the body, but omitting it breaks Pydantic internals.
def _whitelist() -> None:  # noqa: ANN202
    _ = cls  # noqa: F821
