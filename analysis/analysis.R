# =============================================================================
# KAIA-Pilotstudie — Vollständiges R-Analyse-Framework
# Version: 1.0 | Datum: 2026-08-11
# Autorin: Dagmar Rostek, SRH Fernhochschule Riedlingen
# =============================================================================
# Ausführung: source("analysis/analysis.R")
#
# Voraussetzungen:
#   - data/kaia_pilotstudie.csv (CSV-Export aus PostgreSQL)
#   - R >= 4.2.0
#
# Output:
#   - output/figures/abb[1-5]_*.png  (300 dpi, 18x12 cm)
#   - output/tables/kaia_tabellen.docx  (APA-konforme Tabellen für Word)
#
# Messinstrumente:
#   - GSE: Schwarzer & Jerusalem (1995), 10 Items, 4-stufig (1–4), Score = M
#   - MSLQ: Pintrich et al. (1991, adaptiert), 30 Items, 4 Subskalen, 7-stufig
#
# Hypothesen:
#   H1: GSE_T2 > GSE_T1 (Wilcoxon, einseitig, α = .05)
#   H2: sessions_completed ↑ → delta_gse ↑ (Spearman, ungerichtet, α = .05)
#   H3: mslq_gesamt_t1 ↑ → delta_gse ↑ (Spearman, deskriptiv-direktional)
#   H4: convergence_score_mean ↑ → delta_gse ↑ (explorativ)
# =============================================================================

# =============================================================================
# ABSCHNITT 0 — Testdaten (auskommentiert; aktivieren wenn noch keine echten Daten vorliegen)
# =============================================================================
# set.seed(123)
# N_SIM <- 20
# sim <- data.frame(
#   participant_id         = paste0("P", sprintf("%02d", 1:N_SIM)),
#   gse_t1                 = round(runif(N_SIM, 2.2, 3.4), 2),
#   gse_t2                 = round(runif(N_SIM, 2.5, 3.8), 2),
#   mslq_intrinsic_t1      = round(runif(N_SIM, 3.0, 6.5), 2),
#   mslq_intrinsic_t2      = round(runif(N_SIM, 3.2, 6.8), 2),
#   mslq_taskvalue_t1      = round(runif(N_SIM, 3.5, 6.5), 2),
#   mslq_taskvalue_t2      = round(runif(N_SIM, 3.7, 6.8), 2),
#   mslq_selfefficacy_t1   = round(runif(N_SIM, 3.0, 6.0), 2),
#   mslq_selfefficacy_t2   = round(runif(N_SIM, 3.2, 6.3), 2),
#   mslq_elaboration_t1    = round(runif(N_SIM, 3.0, 6.5), 2),
#   mslq_elaboration_t2    = round(runif(N_SIM, 3.2, 6.7), 2),
#   sessions_completed     = sample(5:10, N_SIM, replace = TRUE),
#   convergence_score_mean = round(runif(N_SIM, 0.45, 0.92), 3)
# )
# if (!dir.exists("data")) dir.create("data")
# write.csv(sim, "data/kaia_pilotstudie.csv", row.names = FALSE)
# message("Testdaten generiert und gespeichert: data/kaia_pilotstudie.csv")

# =============================================================================
# ABSCHNITT 1 — Pakete & Setup
# =============================================================================

# Benötigte Pakete (werden automatisch installiert, falls fehlend)
pakete_benoetigt <- c(
  "tidyverse",  # dplyr, ggplot2, tidyr, readr, stringr, purrr
  "flextable",  # APA-konforme Tabellen, Word-Export über officer
  "officer",    # save_as_docx(), fp_border() für Tabellenrahmen
  "rstatix",    # Wilcoxon-Hilfsfunktionen (get_test_label etc.)
  "broom",      # tidy() für cor.test-Ausgabe
  "boot"        # Bootstrap-Konfidenzintervalle für Spearman-Rho
)

pakete_fehlend <- pakete_benoetigt[
  !sapply(pakete_benoetigt, requireNamespace, quietly = TRUE)
]
if (length(pakete_fehlend) > 0) {
  message("Installiere fehlende Pakete: ", paste(pakete_fehlend, collapse = ", "))
  install.packages(pakete_fehlend, repos = "https://cloud.r-project.org")
}

suppressPackageStartupMessages({
  library(tidyverse)
  library(flextable)
  library(officer)
  library(rstatix)
  library(broom)
  library(boot)
})

# Globales ggplot2-Theme: theme_bw, Schriftgröße 12pt (für Word-Einbindung)
theme_set(theme_bw(base_size = 12))

# Okabe-Ito-Farbpalette: barrierefrei, Deuteranopie-sicher
# Quelle: Okabe & Ito (2008), https://jfly.uni-koeln.de/color/
PALETTE <- c(
  gelb      = "#E69F00",
  himmelblau = "#56B4E9",
  gruen     = "#009E73",
  hellgelb  = "#F0E442",
  blau      = "#0072B2",
  orange    = "#D55E00",
  lila      = "#CC79A7"
)

# -----------------------------------------------------------------------------
# Ausgabeverzeichnisse anlegen
# -----------------------------------------------------------------------------
for (pfad in c("output", "output/figures", "output/tables")) {
  if (!dir.exists(pfad)) dir.create(pfad, recursive = TRUE)
}

# =============================================================================
# ABSCHNITT 2 — Daten einlesen & aufbereiten
# =============================================================================

DATEN_PFAD <- "data/kaia_pilotstudie.csv"

if (!file.exists(DATEN_PFAD)) {
  stop(
    "\n[FEHLER] Datei nicht gefunden: ", DATEN_PFAD,
    "\nBitte CSV-Export aus PostgreSQL unter data/kaia_pilotstudie.csv ablegen.",
    "\nZum Testen: Abschnitt 0 oben einkommentieren (Testdaten generieren)."
  )
}

daten_roh <- read_csv(
  DATEN_PFAD,
  col_types = cols(
    participant_id          = col_character(),
    gse_t1                  = col_double(),
    gse_t2                  = col_double(),
    mslq_intrinsic_t1       = col_double(),
    mslq_intrinsic_t2       = col_double(),
    mslq_taskvalue_t1       = col_double(),
    mslq_taskvalue_t2       = col_double(),
    mslq_selfefficacy_t1    = col_double(),
    mslq_selfefficacy_t2    = col_double(),
    mslq_elaboration_t1     = col_double(),
    mslq_elaboration_t2     = col_double(),
    sessions_completed      = col_integer(),
    convergence_score_mean  = col_double()
  ),
  locale = locale(decimal_mark = ".", grouping_mark = ","),
  show_col_types = FALSE
)

message(sprintf(
  "[OK] Rohdaten geladen: %d Zeilen, %d Spalten.",
  nrow(daten_roh), ncol(daten_roh)
))

# --- Abgeleitete Variablen ---
daten <- daten_roh %>%
  mutate(
    # ΔGSE: Prä-Post-Differenz (positiv = Anstieg der Selbstwirksamkeit)
    delta_gse = gse_t2 - gse_t1,

    # MSLQ-Gesamtscore T1: Mittelwert der vier Subskalen-Mittelwerte
    # Hinweis: Alle Subskalen werden gleich gewichtet (keine differentielle
    # Gewichtung, da Pilotstudie; ggf. in Folgestudie adjustieren)
    mslq_gesamt_t1 = rowMeans(
      pick(mslq_intrinsic_t1, mslq_taskvalue_t1,
           mslq_selfefficacy_t1, mslq_elaboration_t1),
      na.rm = TRUE
    ),

    # MSLQ-Gesamtscore T2
    mslq_gesamt_t2 = rowMeans(
      pick(mslq_intrinsic_t2, mslq_taskvalue_t2,
           mslq_selfefficacy_t2, mslq_elaboration_t2),
      na.rm = TRUE
    )
  )

# --- Qualitätsprüfung: Fehlende Werte ---
cat("\n=================================================================\n")
cat("  QUALITÄTSPRÜFUNG: Fehlende Werte\n")
cat("=================================================================\n")

fehlend <- daten %>%
  summarise(across(everything(), ~ sum(is.na(.)))) %>%
  pivot_longer(everything(), names_to = "Variable", values_to = "N_fehlend") %>%
  filter(N_fehlend > 0)

if (nrow(fehlend) == 0) {
  cat("[OK] Keine fehlenden Werte — vollständiger Datensatz.\n")
} else {
  cat("[ACHTUNG] Fehlende Werte in folgenden Variablen:\n")
  print(fehlend)
  cat("Paarweise Tests laufen auf complete.cases — Stichprobengröße kann variieren.\n")
}

# Datensätze für paarweise Tests (nur vollständige Fälle)
d_h1 <- daten %>% filter(complete.cases(gse_t1, gse_t2, delta_gse))
d_h2 <- daten %>% filter(complete.cases(sessions_completed, delta_gse))
d_h3 <- daten %>% filter(complete.cases(mslq_gesamt_t1, delta_gse))
d_h4 <- daten %>% filter(complete.cases(convergence_score_mean, delta_gse))

cat(sprintf("\nVollständige Fälle pro Analyse:\n"))
cat(sprintf("  H1 (GSE Prä/Post):          n = %d\n", nrow(d_h1)))
cat(sprintf("  H2 (Sessions × ΔGSE):       n = %d\n", nrow(d_h2)))
cat(sprintf("  H3 (MSLQ_T1 × ΔGSE):        n = %d\n", nrow(d_h3)))
cat(sprintf("  H4 (Konvergenz × ΔGSE):     n = %d\n\n", nrow(d_h4)))

# =============================================================================
# ABSCHNITT 3 — Deskriptive Statistik
# =============================================================================
cat("=================================================================\n")
cat("  ABSCHNITT 3: Deskriptive Statistik\n")
cat("=================================================================\n\n")

# Hilfsfunktion: Deskriptive Kennwerte einer numerischen Variablen
kennwerte <- function(x, label) {
  x_c <- x[!is.na(x)]
  tibble(
    Variable = label,
    N        = length(x_c),
    M        = round(mean(x_c), 2),
    SD       = round(sd(x_c), 2),
    Median   = round(median(x_c), 2),
    IQR      = round(IQR(x_c), 2),
    Min      = round(min(x_c), 2),
    Max      = round(max(x_c), 2)
  )
}

tab_deskriptiv <- bind_rows(
  kennwerte(daten$gse_t1,               "GSE Prä (T1)"),
  kennwerte(daten$gse_t2,               "GSE Post (T2)"),
  kennwerte(daten$delta_gse,            "ΔGSE (Post – Prä)"),
  kennwerte(daten$mslq_gesamt_t1,       "MSLQ Gesamt Prä (T1)"),
  kennwerte(daten$mslq_gesamt_t2,       "MSLQ Gesamt Post (T2)"),
  kennwerte(daten$sessions_completed,   "Absolvierte Sessions"),
  kennwerte(daten$convergence_score_mean, "LLM-Konvergenz-Score (Ø)")
)

print(tab_deskriptiv)

# Hinweis: Normwert GSE für deutsche Erwachsene: M = 2.97, SD = 0.52
# (Schwarzer, R., & Jerusalem, M., 1995, S. 13)
cat(sprintf(
  "\nReferenz: Normwert GSE deutsche Erwachsene: M = 2.97, SD = 0.52\n"
))

# --- flextable: Deskriptive Statistik (APA-ähnliches Layout) ---
ft_deskriptiv <- flextable(tab_deskriptiv) %>%
  set_header_labels(
    Variable = "Variable", N = "N", M = "M", SD = "SD",
    Median = "Median", IQR = "IQR", Min = "Min.", Max = "Max."
  ) %>%
  bold(part = "header") %>%
  hline_top(border = fp_border(width = 1.5), part = "header") %>%
  hline_bottom(border = fp_border(width = 1.5), part = "header") %>%
  hline_bottom(border = fp_border(width = 1.5), part = "body") %>%
  align(align = "center", part = "all") %>%
  align(j = 1, align = "left", part = "body") %>%
  font(fontname = "Times New Roman", part = "all") %>%
  fontsize(size = 11, part = "all") %>%
  italic(i = ~ Variable == "ΔGSE (Post – Prä)", j = 1, part = "body") %>%
  set_caption(
    caption = as_paragraph(
      as_b("Tabelle 1"),
      as_i(". Deskriptive Statistik aller Messvariablen (N = "),
      as_i(as.character(nrow(daten))),
      as_i(")")
    )
  ) %>%
  add_footer_lines(
    values = "Anmerkung. GSE-Skala: 1 (nicht wahr) bis 4 (genau richtig). MSLQ-Subskalen: 1–7. Konvergenz-Score: 0–1."
  ) %>%
  italic(part = "footer") %>%
  fontsize(size = 9, part = "footer") %>%
  autofit()

# =============================================================================
# ABSCHNITT 4 — H1: Wilcoxon Vorzeichenrangtest
# =============================================================================
cat("\n=================================================================\n")
cat("  ABSCHNITT 4: H1 — Wilcoxon Vorzeichenrangtest\n")
cat("  Hypothese: GSE_T2 > GSE_T1 (gerichtet, einseitig, α = .05)\n")
cat("=================================================================\n\n")

n_h1 <- nrow(d_h1)

# --- Einseitiger Wilcoxon-Test (Post > Prä) ---
# exact = FALSE: Normal-Approximation bei Bindungen (sinnvoll, da GSE 4-stufig)
# correct = TRUE: Stetigkeitskorrektur (empfohlen bei Bindungen, Field 2013)
wilcox_h1 <- wilcox.test(
  x           = d_h1$gse_t2,
  y           = d_h1$gse_t1,
  paired      = TRUE,
  alternative = "greater",
  exact       = FALSE,
  correct     = TRUE
)

# --- Z-Statistik für Effektgröße ---
# Methode: Ableitung aus zweiseitigem p-Wert via Normalverteilungsquantile
# (Field, 2013, "Discovering Statistics", S. 222; Cohen, 1988, S. 23)
# Schritt 1: Zweiseitiger Test für |Z|
wilcox_h1_zw <- wilcox.test(
  x           = d_h1$gse_t2,
  y           = d_h1$gse_t1,
  paired      = TRUE,
  alternative = "two.sided",
  exact       = FALSE,
  correct     = TRUE
)
# Schritt 2: |Z| = qnorm(1 - p_zweiseitig / 2)
Z_abs <- qnorm(1 - wilcox_h1_zw$p.value / 2)
# Schritt 3: Vorzeichen aus Richtung der Differenz
#            W_erwartet = n*(n+1)/4 unter H0 (kein Unterschied)
W_erwartet <- n_h1 * (n_h1 + 1) / 4
Z_h1 <- Z_abs * sign(as.numeric(wilcox_h1$statistic) - W_erwartet)

# --- Effektgröße r = |Z| / sqrt(n) ---
# Bei Messwiederholung: n = Anzahl der Beobachtungspaare (nicht 2*n)
# Interpretation (Cohen, 1988): < .10 vernachlässigbar, .10–.30 klein,
#                               .30–.50 mittel, > .50 groß
effekt_r_h1 <- abs(Z_h1) / sqrt(n_h1)

interpretiere_r <- function(r) {
  ra <- abs(r)
  dplyr::case_when(
    ra < .10 ~ "vernachlässigbar",
    ra < .30 ~ "klein",
    ra < .50 ~ "mittel",
    TRUE     ~ "groß"
  )
}

cat(sprintf(
  "W = %.1f  |  Z = %.3f  |  p = %.4f (einseitig)\n",
  as.numeric(wilcox_h1$statistic), Z_h1, wilcox_h1$p.value
))
cat(sprintf(
  "Effektgröße r = |Z| / sqrt(n) = %.3f / sqrt(%d) = %.3f (%s)\n\n",
  Z_abs, n_h1, effekt_r_h1, interpretiere_r(effekt_r_h1)
))

if (wilcox_h1$p.value < .05) {
  cat("→ H1 ANGENOMMEN: Post-GSE signifikant größer als Prä-GSE (p < .05)\n")
} else {
  cat("→ H1 ABGELEHNT: Kein signifikanter Anstieg der GSE (p ≥ .05)\n")
}

# --- flextable: H1 ---
tab_h1 <- tibble(
  "Test"                = "Wilcoxon Vorzeichenrangtest (einseitig)",
  "n"                   = n_h1,
  "GSE Prä M (SD)"      = sprintf("%.2f (%.2f)",
                                   mean(d_h1$gse_t1, na.rm = TRUE),
                                   sd(d_h1$gse_t1,   na.rm = TRUE)),
  "GSE Post M (SD)"     = sprintf("%.2f (%.2f)",
                                   mean(d_h1$gse_t2, na.rm = TRUE),
                                   sd(d_h1$gse_t2,   na.rm = TRUE)),
  "W"                   = round(as.numeric(wilcox_h1$statistic), 1),
  "Z"                   = round(Z_h1, 3),
  "p (einseitig)"       = round(wilcox_h1$p.value, 4),
  "r"                   = round(effekt_r_h1, 3),
  "Interpretation"      = interpretiere_r(effekt_r_h1)
)

ft_h1 <- flextable(tab_h1) %>%
  bold(part = "header") %>%
  hline_top(border = fp_border(width = 1.5), part = "header") %>%
  hline_bottom(border = fp_border(width = 1.5), part = "header") %>%
  hline_bottom(border = fp_border(width = 1.5), part = "body") %>%
  align(align = "center", part = "all") %>%
  align(j = 1, align = "left", part = "body") %>%
  font(fontname = "Times New Roman", part = "all") %>%
  fontsize(size = 11, part = "all") %>%
  bold(j = "p (einseitig)",
       i = ~ as.numeric(`p (einseitig)`) < .05, part = "body") %>%
  set_caption(
    caption = as_paragraph(
      as_b("Tabelle 2"),
      as_i(". H1: Wilcoxon Vorzeichenrangtest — GSE Prä vs. Post")
    )
  ) %>%
  add_footer_lines(
    values = "Anmerkung. Effektgröße r nach Field (2013). Keine Bonferroni-Korrektur (explorative Pilotstudie)."
  ) %>%
  italic(part = "footer") %>%
  fontsize(size = 9, part = "footer") %>%
  autofit()

# =============================================================================
# ABSCHNITT 5 — H2: Spearman-Korrelation Sessions × ΔGSE
# =============================================================================
cat("\n=================================================================\n")
cat("  ABSCHNITT 5: H2 — Spearman (Sessions × ΔGSE)\n")
cat("  Hypothese: Positiver Zusammenhang (ungerichtet, α = .05)\n")
cat("=================================================================\n\n")

n_h2 <- nrow(d_h2)

cor_h2 <- cor.test(
  d_h2$sessions_completed,
  d_h2$delta_gse,
  method      = "spearman",
  alternative = "two.sided",
  exact       = FALSE   # Keine exakten p-Werte bei Bindungen
)

# --- Bootstrap-Konfidenzintervall (95%, BCa-Methode) ---
# BCa korrigiert für Bias und Schiefe der Stichprobenverteilung
# Bei kleinem N bevorzugt; Fallback: Percentile-Methode
set.seed(42)  # Reproduzierbarkeit der Ergebnisse

boot_h2 <- boot(
  data      = d_h2,
  statistic = function(d, i) {
    cor(d$sessions_completed[i], d$delta_gse[i],
        method = "spearman", use = "complete.obs")
  },
  R = 2000
)

boot_ci_h2 <- tryCatch(
  boot.ci(boot_h2, type = "bca", conf = 0.95),
  error = function(e) {
    message("[INFO] BCa-CI nicht konvergiert; verwende Percentile-Methode.")
    boot.ci(boot_h2, type = "perc", conf = 0.95)
  }
)

# CI-Werte extrahieren (letztes Element der Liste ist das CI-Objekt)
ci_typ_h2 <- tail(names(boot_ci_h2), 1)
ci_h2     <- tail(boot_ci_h2[[ci_typ_h2]][1, ], 2)

cat(sprintf("Spearman-Rho = %.3f  |  S = %.0f  |  p = %.4f\n",
            cor_h2$estimate, cor_h2$statistic, cor_h2$p.value))
cat(sprintf("95%%-KI Bootstrap (%s): [%.3f, %.3f]\n\n",
            ci_typ_h2, ci_h2[1], ci_h2[2]))

if (cor_h2$p.value < .05) {
  cat(sprintf("→ H2 SIGNIFIKANT: rho = %.3f (p < .05)\n", cor_h2$estimate))
} else {
  cat(sprintf("→ H2 NICHT SIGNIFIKANT: rho = %.3f (p = %.3f)\n",
              cor_h2$estimate, cor_h2$p.value))
}

# --- flextable: H2 ---
tab_h2 <- tibble(
  "Hypothese"             = "H2",
  "Test"                  = "Spearman-Rho",
  "n"                     = n_h2,
  "rho"                   = round(cor_h2$estimate, 3),
  "S"                     = round(cor_h2$statistic, 0),
  "p"                     = round(cor_h2$p.value, 4),
  "95%-KI (Bootstrap)"    = sprintf("[%.3f, %.3f]", ci_h2[1], ci_h2[2])
)

ft_h2 <- flextable(tab_h2) %>%
  bold(part = "header") %>%
  hline_top(border = fp_border(width = 1.5), part = "header") %>%
  hline_bottom(border = fp_border(width = 1.5), part = "header") %>%
  hline_bottom(border = fp_border(width = 1.5), part = "body") %>%
  align(align = "center", part = "all") %>%
  align(j = 1:2, align = "left", part = "body") %>%
  font(fontname = "Times New Roman", part = "all") %>%
  fontsize(size = 11, part = "all") %>%
  bold(j = "p", i = ~ as.numeric(p) < .05, part = "body") %>%
  set_caption(
    caption = as_paragraph(
      as_b("Tabelle 3"),
      as_i(". H2: Spearman-Korrelation — Nutzungshäufigkeit × ΔGSE")
    )
  ) %>%
  add_footer_lines(
    values = "Anmerkung. Bootstrap-KI mit R = 2000 Replikationen (BCa-Methode). set.seed(42)."
  ) %>%
  italic(part = "footer") %>%
  fontsize(size = 9, part = "footer") %>%
  autofit()

# =============================================================================
# ABSCHNITT 6 — H3: Spearman-Korrelation MSLQ_T1 × ΔGSE
# =============================================================================
cat("\n=================================================================\n")
cat("  ABSCHNITT 6: H3 — Spearman (MSLQ_T1 × ΔGSE)\n")
cat("  Hypothese: Positiver Zusammenhang (deskriptiv-direktional)\n")
cat("  KEIN konfirmatorischer α-Schwellenwert (N = 20 zu klein)\n")
cat("=================================================================\n\n")

n_h3 <- nrow(d_h3)

cor_h3 <- cor.test(
  d_h3$mslq_gesamt_t1,
  d_h3$delta_gse,
  method      = "spearman",
  alternative = "two.sided",
  exact       = FALSE
)

# Bootstrap-KI H3
set.seed(42)
boot_h3 <- boot(
  data      = d_h3,
  statistic = function(d, i) {
    cor(d$mslq_gesamt_t1[i], d$delta_gse[i],
        method = "spearman", use = "complete.obs")
  },
  R = 2000
)

boot_ci_h3 <- tryCatch(
  boot.ci(boot_h3, type = "bca", conf = 0.95),
  error = function(e) boot.ci(boot_h3, type = "perc", conf = 0.95)
)
ci_typ_h3 <- tail(names(boot_ci_h3), 1)
ci_h3     <- tail(boot_ci_h3[[ci_typ_h3]][1, ], 2)

cat(sprintf("Spearman-Rho = %.3f  |  S = %.0f  |  p = %.4f\n",
            cor_h3$estimate, cor_h3$statistic, cor_h3$p.value))
cat(sprintf("95%%-KI Bootstrap: [%.3f, %.3f]\n", ci_h3[1], ci_h3[2]))
cat("\nHINWEIS: H3 ist deskriptiv-direktional. p-Wert dient nur der Orientierung.\n")
cat("Begründung: N = 20 unterschreitet die Mindeststichprobe für konfirmatorische\n")
cat("Korrelationsanalysen (Faul et al., 2009: N_min ≈ 85 für rho = .30, β = .80).\n")

# --- flextable: H3 ---
tab_h3 <- tibble(
  "Hypothese"          = "H3",
  "Test"               = "Spearman-Rho (deskriptiv)",
  "n"                  = n_h3,
  "rho"                = round(cor_h3$estimate, 3),
  "p (orientierend)"   = round(cor_h3$p.value, 4),
  "95%-KI (Bootstrap)" = sprintf("[%.3f, %.3f]", ci_h3[1], ci_h3[2]),
  "Hinweis"            = "Kein α-Schwellenwert"
)

ft_h3 <- flextable(tab_h3) %>%
  bold(part = "header") %>%
  hline_top(border = fp_border(width = 1.5), part = "header") %>%
  hline_bottom(border = fp_border(width = 1.5), part = "header") %>%
  hline_bottom(border = fp_border(width = 1.5), part = "body") %>%
  align(align = "center", part = "all") %>%
  align(j = 1:2, align = "left", part = "body") %>%
  font(fontname = "Times New Roman", part = "all") %>%
  fontsize(size = 11, part = "all") %>%
  set_caption(
    caption = as_paragraph(
      as_b("Tabelle 4"),
      as_i(". H3: Spearman-Korrelation — MSLQ-Baseline × ΔGSE (deskriptiv)")
    )
  ) %>%
  add_footer_lines(
    values = paste0(
      "Anmerkung. H3 ist explorativ-direktional; kein α-Schwellenwert gesetzt. ",
      "N = 20 reicht für konfirmatorische Korrelationsanalyse nicht aus ",
      "(Faul et al., 2009). Bootstrap-KI mit R = 2000 Replikationen."
    )
  ) %>%
  italic(part = "footer") %>%
  fontsize(size = 9, part = "footer") %>%
  autofit()

# =============================================================================
# ABSCHNITT 7 — H4: LLM-Konvergenz-Score × ΔGSE (Explorativ)
# =============================================================================
cat("\n=================================================================\n")
cat("  ABSCHNITT 7: H4 — Explorativ (Konvergenz-Score × ΔGSE)\n")
cat("=================================================================\n\n")

n_h4 <- nrow(d_h4)

cor_h4 <- cor.test(
  d_h4$convergence_score_mean,
  d_h4$delta_gse,
  method      = "spearman",
  alternative = "two.sided",
  exact       = FALSE
)

cat(sprintf(
  "Spearman-Rho = %.3f  |  p = %.4f  (explorativ, n = %d)\n\n",
  cor_h4$estimate, cor_h4$p.value, n_h4
))
cat("Interpretation: Explorativ — kein Signifikanztest, dient der Hypothesenbildung\n")
cat("für eine potenzielle Folgestudie (größere Stichprobe).\n")

# =============================================================================
# ABSCHNITT 8 — Visualisierungen
# =============================================================================
cat("\n=================================================================\n")
cat("  ABSCHNITT 8: Visualisierungen\n")
cat("=================================================================\n\n")

# Hilfsfunktion: ggplot-Objekt als PNG speichern (300 dpi, 18x12 cm)
speichere_abb <- function(p, dateiname) {
  pfad <- file.path("output", "figures", paste0(dateiname, ".png"))
  ggsave(
    filename = pfad,
    plot     = p,
    width    = 18 / 2.54,   # cm → Inch
    height   = 12 / 2.54,
    dpi      = 300,
    units    = "in",
    bg       = "white"
  )
  cat(sprintf("  [OK] %s\n", pfad))
  invisible(p)
}

# -------------------------------------------------------------------
# Abbildung 1 — Paired-Line-Plot: GSE Prä/Post
# -------------------------------------------------------------------
d_gse_long <- d_h1 %>%
  select(participant_id, gse_t1, gse_t2) %>%
  pivot_longer(
    cols      = c(gse_t1, gse_t2),
    names_to  = "Zeitpunkt",
    values_to = "GSE_Score"
  ) %>%
  mutate(
    Zeitpunkt = factor(
      Zeitpunkt,
      levels = c("gse_t1", "gse_t2"),
      labels = c("Prä (T1)", "Post (T2)")
    )
  )

abb1 <- ggplot(d_gse_long, aes(x = Zeitpunkt, y = GSE_Score)) +
  # Individuelle Verläufe (je eine Linie pro Teilnehmenden)
  geom_line(
    aes(group = participant_id),
    color     = "grey70",
    linewidth = 0.4,
    alpha     = 0.75
  ) +
  geom_point(
    aes(group = participant_id),
    color = "grey60",
    size  = 1.5,
    alpha = 0.75
  ) +
  # Boxplot überlagernd (ohne Ausreißer-Punkte; zeigen schon Rohdaten)
  geom_boxplot(
    width         = 0.22,
    fill          = PALETTE["himmelblau"],
    alpha         = 0.55,
    outlier.shape = NA,
    color         = "grey30",
    linewidth     = 0.6
  ) +
  # Gruppenmittelwert als Raute
  stat_summary(
    fun    = mean,
    geom   = "point",
    shape  = 18,
    size   = 4.5,
    color  = PALETTE["orange"]
  ) +
  # Referenzlinie: Normwert deutsche Erwachsene (Schwarzer & Jerusalem, 1995)
  geom_hline(
    yintercept = 2.97,
    linetype   = "dashed",
    color      = "grey40",
    linewidth  = 0.6
  ) +
  annotate(
    "text",
    x        = 2.47,
    y        = 2.97 + 0.07,
    label    = "Normwert DE: M = 2.97",
    hjust    = 1,
    size     = 3.5,
    color    = "grey35",
    fontface = "italic"
  ) +
  scale_y_continuous(
    limits = c(1, 4),
    breaks = seq(1, 4, 0.5),
    name   = "GSE-Score (Mittelwert der 10 Items, 1–4)"
  ) +
  labs(
    title    = "Abbildung 1. Allgemeine Selbstwirksamkeit (GSE): Prä- und Post-Messung",
    subtitle = sprintf(
      "N = %d | Linien = individuelle Verläufe | Raute = Gruppenmittelwert | gestrichelt = Normwert",
      n_h1
    ),
    x       = "Messzeitpunkt",
    caption = paste0(
      "Schwarzer, R., & Jerusalem, M. (1995). Generalized Self-Efficacy Scale. ",
      "In J. Weinman, S. Wright & M. Johnston (Hrsg.), Measures in health psychology: ",
      "A user's portfolio (S. 35–37). NFER-NELSON."
    )
  ) +
  theme(
    plot.title    = element_text(size = 12, face = "bold"),
    plot.subtitle = element_text(size = 10, color = "grey30"),
    plot.caption  = element_text(size = 7,  color = "grey50", hjust = 0),
    axis.title    = element_text(size = 11),
    axis.text     = element_text(size = 11)
  )

speichere_abb(abb1, "abb1_gse_prapost")

# -------------------------------------------------------------------
# Abbildung 2 — Scatterplot: Sessions × ΔGSE (H2)
# -------------------------------------------------------------------
rho_label_h2 <- sprintf(
  "Spearman-Rho = %.3f\np = %.3f",
  cor_h2$estimate, cor_h2$p.value
)

abb2 <- ggplot(d_h2, aes(x = sessions_completed, y = delta_gse)) +
  geom_hline(
    yintercept = 0,
    linetype   = "dashed",
    color      = "grey50",
    linewidth  = 0.5
  ) +
  geom_point(
    color = PALETTE["gruen"],
    size  = 3,
    alpha = 0.85
  ) +
  geom_smooth(
    method    = "lm",
    formula   = y ~ x,
    se        = TRUE,
    color     = PALETTE["blau"],
    fill      = PALETTE["blau"],
    alpha     = 0.15,
    linewidth = 1
  ) +
  annotate(
    "text",
    x        = max(d_h2$sessions_completed, na.rm = TRUE),
    y        = max(d_h2$delta_gse, na.rm = TRUE),
    label    = rho_label_h2,
    hjust    = 1,
    vjust    = 1,
    size     = 4,
    color    = "grey30",
    fontface = "italic"
  ) +
  scale_x_continuous(
    breaks = 1:10,
    name   = "Absolvierte Sessions (Anzahl)"
  ) +
  scale_y_continuous(name = expression(paste(Delta, "GSE (Post – Prä)"))) +
  labs(
    title    = "Abbildung 2. Nutzungshäufigkeit und GSE-Veränderung (H2)",
    subtitle = sprintf(
      "N = %d | Linie = OLS-Regressionsgerade mit 95%%-KI | gestrichelt = kein Effekt",
      n_h2
    ),
    caption = "H2: Positive Korrelation zwischen Nutzungshäufigkeit und ΔGSE (Spearman, zweiseitig)"
  ) +
  theme(
    plot.title    = element_text(size = 12, face = "bold"),
    plot.subtitle = element_text(size = 10, color = "grey30"),
    plot.caption  = element_text(size = 8,  color = "grey50", hjust = 0),
    axis.title    = element_text(size = 11),
    axis.text     = element_text(size = 11)
  )

speichere_abb(abb2, "abb2_sessions_delta_gse")

# -------------------------------------------------------------------
# Abbildung 3 — Scatterplot: MSLQ_T1 × ΔGSE (H3)
# -------------------------------------------------------------------
rho_label_h3 <- sprintf(
  "Spearman-Rho = %.3f\np = %.3f (deskriptiv)",
  cor_h3$estimate, cor_h3$p.value
)

abb3 <- ggplot(d_h3, aes(x = mslq_gesamt_t1, y = delta_gse)) +
  geom_hline(
    yintercept = 0,
    linetype   = "dashed",
    color      = "grey50",
    linewidth  = 0.5
  ) +
  geom_point(
    color = PALETTE["lila"],
    size  = 3,
    alpha = 0.85
  ) +
  geom_smooth(
    method    = "lm",
    formula   = y ~ x,
    se        = TRUE,
    color     = PALETTE["orange"],
    fill      = PALETTE["orange"],
    alpha     = 0.15,
    linewidth = 1
  ) +
  annotate(
    "text",
    x        = max(d_h3$mslq_gesamt_t1, na.rm = TRUE),
    y        = max(d_h3$delta_gse, na.rm = TRUE),
    label    = rho_label_h3,
    hjust    = 1,
    vjust    = 1,
    size     = 4,
    color    = "grey30",
    fontface = "italic"
  ) +
  scale_x_continuous(
    limits = c(1, 7),
    breaks = 1:7,
    name   = "MSLQ Gesamtscore Prä (T1, Mittelwert 1–7)"
  ) +
  scale_y_continuous(name = expression(paste(Delta, "GSE (Post – Prä)"))) +
  labs(
    title    = "Abbildung 3. Lernmotivation (MSLQ-Baseline) und GSE-Veränderung (H3)",
    subtitle = sprintf(
      "N = %d | Deskriptiv-direktionaler Zusammenhang — kein α-Schwellenwert",
      n_h3
    ),
    caption = paste0(
      "H3 (deskriptiv): Pintrich, P. R., Smith, D. A. F., Garcia, T., & McKeachie, W. J. (1991). ",
      "A Manual for the Use of the Motivated Strategies for Learning Questionnaire."
    )
  ) +
  theme(
    plot.title    = element_text(size = 12, face = "bold"),
    plot.subtitle = element_text(size = 10, color = "grey30"),
    plot.caption  = element_text(size = 7,  color = "grey50", hjust = 0),
    axis.title    = element_text(size = 11),
    axis.text     = element_text(size = 11)
  )

speichere_abb(abb3, "abb3_mslq_delta_gse")

# -------------------------------------------------------------------
# Abbildung 4 — Grouped Boxplot: MSLQ Subskalen Prä/Post
# -------------------------------------------------------------------
d_mslq_long <- daten %>%
  select(
    participant_id,
    "Intrinsische\nZielorientierung_t1"  = mslq_intrinsic_t1,
    "Intrinsische\nZielorientierung_t2"  = mslq_intrinsic_t2,
    "Aufgabenwert_t1"                    = mslq_taskvalue_t1,
    "Aufgabenwert_t2"                    = mslq_taskvalue_t2,
    "Lern-\nSelbstwirksamkeit_t1"        = mslq_selfefficacy_t1,
    "Lern-\nSelbstwirksamkeit_t2"        = mslq_selfefficacy_t2,
    "Elaboration_t1"                     = mslq_elaboration_t1,
    "Elaboration_t2"                     = mslq_elaboration_t2
  ) %>%
  pivot_longer(
    cols      = -participant_id,
    names_to  = "Variable",
    values_to = "Score"
  ) %>%
  mutate(
    Subskala  = str_remove(Variable, "_t[12]$"),
    Zeitpunkt = if_else(str_ends(Variable, "_t1"), "Prä (T1)", "Post (T2)"),
    Zeitpunkt = factor(Zeitpunkt, levels = c("Prä (T1)", "Post (T2)"))
  )

abb4 <- ggplot(d_mslq_long,
               aes(x = Subskala, y = Score, fill = Zeitpunkt)) +
  geom_boxplot(
    position      = position_dodge(width = 0.72),
    width         = 0.60,
    alpha         = 0.80,
    outlier.shape = 21,
    outlier.size  = 1.5,
    outlier.alpha = 0.7,
    color         = "grey30",
    linewidth     = 0.4
  ) +
  scale_fill_manual(
    values = c("Prä (T1)" = PALETTE["himmelblau"],
               "Post (T2)" = PALETTE["gelb"]),
    name   = "Messzeitpunkt"
  ) +
  scale_y_continuous(
    limits = c(1, 7),
    breaks = 1:7,
    name   = "Subskalenwert (Mittelwert, 1–7)"
  ) +
  labs(
    title    = "Abbildung 4. MSLQ-Subskalen: Prä- und Post-Vergleich",
    subtitle = sprintf(
      "N = %d | Pintrich et al. (1991), 4 Subskalen aus KAIA-Adaptation",
      nrow(daten)
    ),
    x       = "MSLQ-Subskala",
    caption = "Pintrich, P. R., Smith, D. A. F., Garcia, T., & McKeachie, W. J. (1991). MSLQ Manual. University of Michigan."
  ) +
  theme(
    plot.title      = element_text(size = 12, face = "bold"),
    plot.subtitle   = element_text(size = 10, color = "grey30"),
    plot.caption    = element_text(size = 7,  color = "grey50", hjust = 0),
    axis.title      = element_text(size = 11),
    axis.text.x     = element_text(size = 9),
    axis.text.y     = element_text(size = 11),
    legend.title    = element_text(size = 11),
    legend.text     = element_text(size = 10),
    legend.position = "top"
  )

speichere_abb(abb4, "abb4_mslq_subskalen_prapost")

# -------------------------------------------------------------------
# Abbildung 5 — Scatterplot: Konvergenz-Score × ΔGSE (H4)
# -------------------------------------------------------------------
rho_label_h4 <- sprintf(
  "Spearman-Rho = %.3f\np = %.3f (explorativ)",
  cor_h4$estimate, cor_h4$p.value
)

abb5 <- ggplot(d_h4, aes(x = convergence_score_mean, y = delta_gse)) +
  geom_hline(
    yintercept = 0,
    linetype   = "dashed",
    color      = "grey50",
    linewidth  = 0.5
  ) +
  geom_point(
    color = PALETTE["gelb"],
    size  = 3,
    alpha = 0.85
  ) +
  geom_smooth(
    method    = "lm",
    formula   = y ~ x,
    se        = TRUE,
    color     = PALETTE["orange"],
    fill      = PALETTE["orange"],
    alpha     = 0.15,
    linewidth = 1
  ) +
  annotate(
    "text",
    x        = 0.98,
    y        = max(d_h4$delta_gse, na.rm = TRUE),
    label    = rho_label_h4,
    hjust    = 1,
    vjust    = 1,
    size     = 4,
    color    = "grey30",
    fontface = "italic"
  ) +
  scale_x_continuous(
    limits = c(0, 1),
    breaks = seq(0, 1, 0.2),
    name   = "LLM-Konvergenz-Score (Ø über Sessions, 0–1)"
  ) +
  scale_y_continuous(name = expression(paste(Delta, "GSE (Post – Prä)"))) +
  labs(
    title    = "Abbildung 5. LLM-Konvergenz-Score und GSE-Veränderung (H4, explorativ)",
    subtitle = sprintf(
      "N = %d | Explorativ: kein Signifikanztest — dient der Hypothesenbildung",
      n_h4
    ),
    caption = "H4: Der LLM-Konvergenz-Score aggregiert sokratische Gesprächsqualität über alle Sessions (KAIA-intern)."
  ) +
  theme(
    plot.title    = element_text(size = 12, face = "bold"),
    plot.subtitle = element_text(size = 10, color = "grey30"),
    plot.caption  = element_text(size = 8,  color = "grey50", hjust = 0),
    axis.title    = element_text(size = 11),
    axis.text     = element_text(size = 11)
  )

speichere_abb(abb5, "abb5_convergence_delta_gse")

# =============================================================================
# ABSCHNITT 9 — Export: Tabellen als Word-Dokument
# =============================================================================
cat("\n=================================================================\n")
cat("  ABSCHNITT 9: Export — Tabellen als Word-Dokument\n")
cat("=================================================================\n\n")

word_pfad <- "output/tables/kaia_tabellen.docx"

# Alle Tabellen-Objekte für programmatischen Zugriff
tabellen <- list(
  deskriptiv = ft_deskriptiv,
  h1_wilcoxon = ft_h1,
  h2_spearman_sessions = ft_h2,
  h3_spearman_mslq     = ft_h3
)

tryCatch({
  doc <- read_docx() %>%
    # Titelseite / Überschrift
    body_add_par("KAIA-Pilotstudie — Statistische Ergebnistabellen",
                 style = "heading 1") %>%
    body_add_par(sprintf("Generiert: %s | N = %d", Sys.Date(), nrow(daten)),
                 style = "Normal") %>%
    body_add_par("") %>%

    # Tabelle 1: Deskriptive Statistik
    body_add_par("Tabelle 1. Deskriptive Statistik", style = "heading 2") %>%
    body_add_flextable(ft_deskriptiv) %>%
    body_add_par("") %>%

    # Tabelle 2: H1 Wilcoxon
    body_add_par("Tabelle 2. H1: Wilcoxon Vorzeichenrangtest", style = "heading 2") %>%
    body_add_flextable(ft_h1) %>%
    body_add_par("") %>%

    # Tabelle 3: H2 Spearman Sessions
    body_add_par("Tabelle 3. H2: Spearman-Korrelation Sessions × ΔGSE",
                 style = "heading 2") %>%
    body_add_flextable(ft_h2) %>%
    body_add_par("") %>%

    # Tabelle 4: H3 Spearman MSLQ
    body_add_par("Tabelle 4. H3: Spearman-Korrelation MSLQ × ΔGSE",
                 style = "heading 2") %>%
    body_add_flextable(ft_h3) %>%
    body_add_par("")

  print(doc, target = word_pfad)
  cat(sprintf("[OK] Word-Dokument gespeichert: %s\n", word_pfad))

}, error = function(e) {
  cat(sprintf("[FEHLER] Word-Export fehlgeschlagen: %s\n", conditionMessage(e)))
  cat("Tabellen sind als R-Objekte in der Liste 'tabellen' verfügbar.\n")
  cat("Manueller Export einer Tabelle: save_as_docx(tabellen$deskriptiv, path = 'tabelle.docx')\n")
})

# =============================================================================
# ABSCHNITT 10 — Ergebniszusammenfassung
# =============================================================================
cat("\n")
cat("================================================================\n")
cat("  KAIA-PILOTSTUDIE — ERGEBNISZUSAMMENFASSUNG\n")
cat("================================================================\n\n")

cat(sprintf("Stichprobe:  N = %d\n", nrow(daten)))
cat(sprintf("Analysetyp:  Single-Arm, explorative Pilotstudie\n"))
cat(sprintf("Datum:       %s\n\n", Sys.Date()))

cat(sprintf(
  "H1 — GSE-Veränderung (Wilcoxon, einseitig, α = .05):\n  W = %.1f | Z = %.3f | p = %.4f | r = %.3f (%s)\n\n",
  as.numeric(wilcox_h1$statistic), Z_h1, wilcox_h1$p.value,
  effekt_r_h1, interpretiere_r(effekt_r_h1)
))

cat(sprintf(
  "H2 — Nutzungshäufigkeit × ΔGSE (Spearman, α = .05):\n  rho = %.3f | p = %.4f | 95%%-KI [%.3f, %.3f]\n\n",
  cor_h2$estimate, cor_h2$p.value, ci_h2[1], ci_h2[2]
))

cat(sprintf(
  "H3 — MSLQ_T1 × ΔGSE (Spearman, deskriptiv):\n  rho = %.3f | p = %.4f (orientierend) | 95%%-KI [%.3f, %.3f]\n\n",
  cor_h3$estimate, cor_h3$p.value, ci_h3[1], ci_h3[2]
))

cat(sprintf(
  "H4 — LLM-Konvergenz × ΔGSE (explorativ):\n  rho = %.3f | p = %.4f\n\n",
  cor_h4$estimate, cor_h4$p.value
))

cat("----------------------------------------------------------------\n")
cat("Outputs:\n")
cat("  output/figures/abb1_gse_prapost.png\n")
cat("  output/figures/abb2_sessions_delta_gse.png\n")
cat("  output/figures/abb3_mslq_delta_gse.png\n")
cat("  output/figures/abb4_mslq_subskalen_prapost.png\n")
cat("  output/figures/abb5_convergence_delta_gse.png\n")
cat("  output/tables/kaia_tabellen.docx\n")
cat("----------------------------------------------------------------\n\n")

# R-Sessioninfo für Reproduzierbarkeit dokumentieren
cat("=== Session-Info (für Reproduzierbarkeitsangaben in der Thesis) ===\n")
sessionInfo()
