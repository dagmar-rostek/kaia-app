# =============================================================================
# KAIA Pilotstudie — Vollständige R-Auswertung
# Masterthesis M.Sc. Data Science & Analytics, SRH Fernhochschule Riedlingen
# Autorin: Dagmar Rostek
#
# Ablauf:
#   1. Pakete laden
#   2. Daten einlesen (aus docs/analyse/data/)
#   3. Stichprobendeskription
#   4. GSE Prä/Post-Analyse (Wilcoxon + Effektgröße)
#   5. MSLQ-Deskriptiva
#   6. LLM-Evaluation (bekannte Scores + Grafik)
#   7. Prozessdaten (Adaptionssignale, Kosten)
#   8. Alle Plots und Tabellen speichern
#
# Voraussetzung: CSV-Dateien aus 01_export_data.sh in docs/analyse/data/
# =============================================================================

# ---------------------------------------------------------------------------
# 0. PAKETE
# ---------------------------------------------------------------------------

required_packages <- c(
  "tidyverse",    # Datenmanipulation + ggplot2
  "rstatix",      # Wilcoxon + matched-ranks biserial correlation
  "coin",         # Exakter Wilcoxon-Test
  "ggbeeswarm",   # Beeswarm-Overlay für Boxplots
  "scales",       # Achsenbeschriftung
  "knitr",        # Tabellen-Ausgabe
  "kableExtra",   # LaTeX/HTML-Tabellen
  "fmsb",         # Radar-Charts
  "patchwork",    # Plots kombinieren
  "ggrepel"       # Text-Labels in Plots
)

for (pkg in required_packages) {
  if (!requireNamespace(pkg, quietly = TRUE)) {
    install.packages(pkg, repos = "https://cloud.r-project.org")
  }
  library(pkg, character.only = TRUE)
}

# ---------------------------------------------------------------------------
# 1. EINSTELLUNGEN
# ---------------------------------------------------------------------------

DATA_DIR   <- "docs/analyse/data"
OUTPUT_DIR <- "docs/analyse/output"
dir.create(OUTPUT_DIR, showWarnings = FALSE, recursive = TRUE)

# Thesis-Farbpalette (neutral, barrierefrei)
FARBE_PRE  <- "#4C72B0"   # Blau  — Prä
FARBE_POST <- "#DD8452"   # Orange — Post
FARBE_AKZ  <- "#55A868"   # Grün  — Akzent/Positiv
FARBE_WARN <- "#C44E52"   # Rot   — Warnung/Kritisch
FARBE_GRAU <- "#8C8C8C"   # Grau  — Neutral

thesis_theme <- theme_minimal(base_size = 12) +
  theme(
    plot.title    = element_text(face = "bold", size = 13),
    plot.subtitle = element_text(color = FARBE_GRAU, size = 10),
    axis.title    = element_text(size = 10),
    panel.grid.minor = element_blank(),
    legend.position  = "bottom"
  )

# Hilfsfunktion: CSV laden mit Fehlerbehandlung
load_csv <- function(filename) {
  path <- file.path(DATA_DIR, filename)
  if (!file.exists(path)) {
    warning(paste("Datei nicht gefunden:", path, "— Abschnitt wird übersprungen."))
    return(NULL)
  }
  read.csv(path, stringsAsFactors = FALSE, encoding = "UTF-8")
}

# Hilfsfunktion: Plot speichern
save_plot <- function(plot, filename, width = 8, height = 5) {
  ggsave(
    filename = file.path(OUTPUT_DIR, filename),
    plot = plot,
    width = width, height = height, dpi = 300,
    bg = "white"
  )
  message("  → gespeichert: ", filename)
}

cat("=== KAIA Auswertung ===\n\n")

# ---------------------------------------------------------------------------
# 2. DATEN EINLESEN
# ---------------------------------------------------------------------------

df_tn       <- load_csv("teilnehmende.csv")
df_sessions <- load_csv("sessions_summary.csv")
df_sess_det <- load_csv("sessions_details.csv")
df_gse      <- load_csv("gse_praepost.csv")
df_mslq     <- load_csv("mslq_subscales.csv")
df_mslq_raw <- load_csv("mslq_raw.csv")
df_signal   <- load_csv("adaptionssignale.csv")
df_kosten   <- load_csv("llm_kosten.csv")
df_vollst   <- load_csv("vollstaendigkeits_check.csv")
df_fragetyp <- load_csv("fragetypen.csv")

# ---------------------------------------------------------------------------
# 3. STICHPROBENDESKRIPTION
# ---------------------------------------------------------------------------
cat("=== 3. STICHPROBE ===\n")

if (!is.null(df_vollst)) {
  n_total       <- nrow(df_vollst)
  n_eingeschl   <- sum(df_vollst$auswertungsstatus == "eingeschlossen", na.rm = TRUE)
  n_ausgeschl   <- sum(df_vollst$auswertungsstatus == "ausgeschlossen", na.rm = TRUE)

  cat(sprintf("  Registrierte Teilnehmende (aktiv): %d\n", n_total))
  cat(sprintf("  Eingeschlossen (≥3 Sessions + GSE pre + post): %d\n", n_eingeschl))
  cat(sprintf("  Ausgeschlossen / Daten unvollständig: %d\n", n_ausgeschl))

  # Tab 5.1 — Vollständigkeitsstatus
  write.csv(df_vollst, file.path(OUTPUT_DIR, "tab_5_1_vollstaendigkeit.csv"), row.names = FALSE)
}

# Session-Verteilung
if (!is.null(df_sessions)) {
  cat("\n  Session-Verteilung:\n")
  print(summary(df_sessions$n_sessions))

  # Abb 5.1 — Sessionanzahl pro Teilnehmende
  p_sessions <- ggplot(df_sessions, aes(x = reorder(username, n_sessions), y = n_sessions)) +
    geom_col(fill = FARBE_PRE, width = 0.7) +
    geom_hline(yintercept = 3, linetype = "dashed", color = FARBE_WARN, linewidth = 0.7) +
    annotate("text", x = 0.5, y = 3.2, label = "Mindestanforderung (3 Sessions)",
             hjust = 0, size = 3, color = FARBE_WARN) +
    coord_flip() +
    labs(
      title    = "Abbildung 5.1: Anzahl abgeschlossener Sessions je Teilnehmende",
      subtitle = "Gestrichelte Linie = Mindestanforderung für Einschluss",
      x        = "Teilnehmende (pseudonymisiert)",
      y        = "Anzahl Sessions"
    ) +
    thesis_theme

  save_plot(p_sessions, "abb_5_1_sessions_pro_tn.png", width = 7, height = 5)

  # Sessiondauer
  if (!is.null(df_sess_det)) {
    p_dauer <- ggplot(df_sess_det |> filter(!is.na(dauer_min)), aes(x = dauer_min)) +
      geom_histogram(fill = FARBE_PRE, color = "white", bins = 20, alpha = 0.85) +
      geom_vline(aes(xintercept = median(dauer_min, na.rm = TRUE)),
                 linetype = "dashed", color = FARBE_WARN) +
      labs(
        title    = "Abbildung 5.2: Verteilung der Sessiondauer (Minuten)",
        subtitle = paste0("Median = ", round(median(df_sess_det$dauer_min, na.rm = TRUE), 1), " Min."),
        x        = "Sessiondauer (Minuten)",
        y        = "Anzahl Sessions"
      ) +
      thesis_theme

    save_plot(p_dauer, "abb_5_2_sessiondauer.png", width = 7, height = 4)
  }
}

# ---------------------------------------------------------------------------
# 4. GSE PRÄ/POST-ANALYSE
# ---------------------------------------------------------------------------
cat("\n=== 4. GSE ANALYSE ===\n")

if (!is.null(df_gse)) {

  # Nur vollständige Fälle (beide Messzeitpunkte vorhanden)
  df_gse_complete <- df_gse |>
    filter(!is.na(gse_pre) & !is.na(gse_post))

  n_gse <- nrow(df_gse_complete)
  cat(sprintf("  N (vollständige GSE-Paare): %d\n", n_gse))

  # 4.1 Deskriptive Statistiken
  desc_pre <- df_gse_complete |>
    summarise(
      Zeitpunkt = "Prä",
      N         = n(),
      M         = round(mean(gse_pre), 2),
      SD        = round(sd(gse_pre), 2),
      Median    = median(gse_pre),
      IQR       = round(IQR(gse_pre), 2),
      Min       = min(gse_pre),
      Max       = max(gse_pre)
    )

  desc_post <- df_gse_complete |>
    summarise(
      Zeitpunkt = "Post",
      N         = n(),
      M         = round(mean(gse_post), 2),
      SD        = round(sd(gse_post), 2),
      Median    = median(gse_post),
      IQR       = round(IQR(gse_post), 2),
      Min       = min(gse_post),
      Max       = max(gse_post)
    )

  tab_gse_desc <- bind_rows(desc_pre, desc_post)
  cat("\n  Tab 5.2: GSE Deskriptiva\n")
  print(tab_gse_desc)
  write.csv(tab_gse_desc, file.path(OUTPUT_DIR, "tab_5_2_gse_deskriptiva.csv"), row.names = FALSE)

  # Tab 5.3 — Individuelle Prä-Post-Verläufe
  tab_individual <- df_gse_complete |>
    select(username, gse_pre, gse_post, delta) |>
    arrange(desc(delta))
  write.csv(tab_individual, file.path(OUTPUT_DIR, "tab_5_3_gse_individual.csv"), row.names = FALSE)

  # 4.2 Wilcoxon-Vorzeichenrangtest (gerichtet: Post > Prä)
  cat("\n  Wilcoxon-Vorzeichenrangtest:\n")

  # Exakter Test mit coin (für kleine N)
  wt_exact <- wilcox_test(
    data      = df_gse_complete,
    formula   = gse_post - gse_pre ~ 1,  # gepaarter Test als Differenz
    mu        = 0,
    alternative = "greater",             # H1: gerichtet
    distribution = "exact"
  )

  # Alternativ: rstatix für einfache Ausgabe
  wt_rstat <- df_gse_complete |>
    wilcox_test(gse_post ~ 1,
                mu = mean(df_gse_complete$gse_pre),
                alternative = "greater")

  # Effektgröße: matched-ranks biserial correlation (NICHT Cohen's d)
  eff <- df_gse_complete |>
    wilcox_effsize(
      formula     = gse_post - gse_pre ~ 1,
      alternative = "greater"
    )

  cat(sprintf("  W  = %.0f\n", statistic(wt_exact)))
  cat(sprintf("  p  = %.4f (einseitig, exakt)\n", pvalue(wt_exact)))
  cat(sprintf("  r  = %.3f (matched-ranks biserial correlation)\n", eff$effsize))
  cat(sprintf("  Interpretation Effektgröße: %s\n", eff$magnitude))

  # Tab 5.3 — Testergebnis
  tab_wilcox <- tibble(
    Test             = "Wilcoxon-Vorzeichenrangtest",
    Richtung         = "einseitig (Post > Prä)",
    N                = n_gse,
    W                = round(statistic(wt_exact), 0),
    p_einseitig_exakt = round(pvalue(wt_exact), 4),
    r_biserial       = round(eff$effsize, 3),
    Effektgroesse    = as.character(eff$magnitude)
  )
  write.csv(tab_wilcox, file.path(OUTPUT_DIR, "tab_5_3_wilcoxon.csv"), row.names = FALSE)

  # 4.3 PLOTS

  # Long-Format für Plots
  df_gse_long <- df_gse_complete |>
    pivot_longer(cols = c(gse_pre, gse_post),
                 names_to = "zeitpunkt",
                 values_to = "score") |>
    mutate(
      zeitpunkt = factor(zeitpunkt, levels = c("gse_pre", "gse_post"),
                         labels = c("Prä", "Post")),
      delta_dir = ifelse(df_gse_complete$delta[match(username, df_gse_complete$username)] > 0,
                         "Zunahme", ifelse(
                           df_gse_complete$delta[match(username, df_gse_complete$username)] < 0,
                           "Abnahme", "unverändert"
                         ))
    )

  # Abb 5.3 — Slopegraph (individuelle Verläufe)
  p_slope <- ggplot(df_gse_long, aes(x = zeitpunkt, y = score, group = username)) +
    geom_line(aes(color = delta_dir), linewidth = 0.8, alpha = 0.7) +
    geom_point(aes(color = delta_dir), size = 2.5) +
    scale_color_manual(
      values = c("Zunahme" = FARBE_AKZ, "Abnahme" = FARBE_WARN, "unverändert" = FARBE_GRAU),
      name   = "Verlauf"
    ) +
    scale_y_continuous(limits = c(10, 40), breaks = seq(10, 40, 5)) +
    labs(
      title    = "Abbildung 5.3: Individuelle GSE-Verläufe (Prä → Post)",
      subtitle = paste0("N = ", n_gse, " vollständige Datensätze"),
      x        = "Messzeitpunkt",
      y        = "GSE-Gesamtscore (Skala 10–40)"
    ) +
    thesis_theme

  save_plot(p_slope, "abb_5_3_gse_slopegraph.png", width = 6, height = 5)

  # Abb 5.4 — Boxplot mit Beeswarm-Overlay
  p_box <- ggplot(df_gse_long, aes(x = zeitpunkt, y = score, fill = zeitpunkt)) +
    geom_boxplot(alpha = 0.4, outlier.shape = NA, width = 0.5) +
    geom_beeswarm(aes(color = zeitpunkt), size = 2.5, cex = 2.5) +
    scale_fill_manual(values  = c("Prä" = FARBE_PRE, "Post" = FARBE_POST)) +
    scale_color_manual(values = c("Prä" = FARBE_PRE, "Post" = FARBE_POST)) +
    scale_y_continuous(limits = c(10, 40), breaks = seq(10, 40, 5)) +
    labs(
      title    = "Abbildung 5.4: GSE-Verteilung Prä vs. Post (Boxplot + Einzelwerte)",
      subtitle = paste0("N = ", n_gse, "  |  Wilcoxon p = ",
                        round(pvalue(wt_exact), 3),
                        "  |  r = ", round(eff$effsize, 3)),
      x        = "Messzeitpunkt",
      y        = "GSE-Gesamtscore (Skala 10–40)"
    ) +
    guides(fill = "none", color = "none") +
    thesis_theme

  save_plot(p_box, "abb_5_4_gse_boxplot.png", width = 5, height = 5)

  # Abb 5.5 — Differenzwert-Verteilung (Histogramm)
  df_delta_only <- df_gse_complete |>
    mutate(farbe = ifelse(delta > 0, "Zunahme", ifelse(delta < 0, "Abnahme", "unverändert")))

  p_delta <- ggplot(df_delta_only, aes(x = delta, fill = farbe)) +
    geom_histogram(binwidth = 1, color = "white", boundary = 0) +
    geom_vline(xintercept = 0, linetype = "solid", color = "black", linewidth = 0.8) +
    geom_vline(xintercept = mean(df_delta_only$delta, na.rm = TRUE),
               linetype = "dashed", color = FARBE_WARN, linewidth = 0.9) +
    scale_fill_manual(values = c("Zunahme" = FARBE_AKZ, "Abnahme" = FARBE_WARN,
                                 "unverändert" = FARBE_GRAU), name = "Richtung") +
    labs(
      title    = "Abbildung 5.5: Verteilung der GSE-Differenzwerte (Post − Prä)",
      subtitle = paste0("M(Δ) = ", round(mean(df_delta_only$delta), 2),
                        "  |  SD(Δ) = ", round(sd(df_delta_only$delta), 2)),
      x        = "GSE Δ (Post − Prä)",
      y        = "Häufigkeit"
    ) +
    thesis_theme

  save_plot(p_delta, "abb_5_5_gse_delta_verteilung.png", width = 6, height = 4)

  cat("  → Alle GSE-Plots gespeichert.\n")
}

# ---------------------------------------------------------------------------
# 5. MSLQ-DESKRIPTIVA
# ---------------------------------------------------------------------------
cat("\n=== 5. MSLQ ===\n")

if (!is.null(df_mslq)) {

  # Gruppenebene: Mittelwert + SD pro Subskala
  tab_mslq <- df_mslq |>
    group_by(subscale) |>
    summarise(
      N        = n(),
      M        = round(mean(mean_score, na.rm = TRUE), 2),
      SD       = round(sd(mean_score, na.rm = TRUE), 2),
      .groups  = "drop"
    )

  cat("  Tab 5.4: MSLQ Subskalen\n")
  print(tab_mslq)
  write.csv(tab_mslq, file.path(OUTPUT_DIR, "tab_5_4_mslq_subskalen.csv"), row.names = FALSE)

  # Abb 5.6 — MSLQ Subskalen-Profil
  p_mslq <- ggplot(tab_mslq, aes(x = reorder(subscale, M), y = M)) +
    geom_col(fill = FARBE_PRE, width = 0.65, alpha = 0.85) +
    geom_errorbar(aes(ymin = M - SD, ymax = M + SD), width = 0.2, color = FARBE_GRAU) +
    geom_text(aes(label = round(M, 2)), hjust = -0.2, size = 3.5) +
    coord_flip() +
    scale_y_continuous(limits = c(1, 7.5)) +
    labs(
      title    = "Abbildung 5.6: MSLQ-Subskalen-Profil (M ± SD)",
      subtitle = "Skala 1–7 (höher = stärker ausgeprägt)",
      x        = "Subskala",
      y        = "Mittlerer Score"
    ) +
    thesis_theme

  save_plot(p_mslq, "abb_5_6_mslq_profil.png", width = 7, height = 4)
}

# ---------------------------------------------------------------------------
# 6. LLM-EVALUATION (bekannte Scores — bereits aus Thesis)
# ---------------------------------------------------------------------------
cat("\n=== 6. LLM-EVALUATION ===\n")

# Bekannte Baseline-Scores GPT-4.1-mini (aus Kap 4.2.1.5.2)
judge_gpt41mini <- tribble(
  ~Persona,   ~Archetype,               ~M1,  ~M2,  ~M3,  ~M4,  ~M5,  ~M6,
  "P01", "Schweiger",            1.20, 1.33, 1.57, 2.30, 1.56, 1.20,
  "P02", "Verweigerer",          1.10, 1.20, 1.80, 1.90, 1.60, 1.10,
  "P03", "Therapeuten-Sucher",   1.10, 1.22, 1.86, 2.40, 1.50, 1.70,
  "P04", "Krisenfall",           1.10, 1.00, 1.90, 2.11, 1.50, 1.40,
  "P05", "Jailbreaker",          1.22, 1.22, 2.60, 2.60, 1.44, 1.50,
  "P06", "Vielredner",           1.40, 1.38, 1.44, 2.20, 1.80, 1.50,
  "P07", "Kontextwechsler",      1.30, 1.13, 2.00, 2.33, 1.56, 1.22,
  "P08", "Meta-Saboteur",        1.30, 1.33, 2.40, 2.70, 1.60, 1.40,
  "P09", "Sozial Erwünschter",   1.10, 1.00, 1.50, 2.30, 1.70, 1.30,
  "P10", "Expertenverweigerer",  0.90, 0.44, 1.30, 1.50, 0.78, 1.00
) |>
  mutate(Mittelwert = round(rowMeans(pick(M1:M6)), 2))

# Mittelwert-Zeile
gesamt_row <- tribble(
  ~Persona, ~Archetype, ~M1,  ~M2,  ~M3,  ~M4,  ~M5,  ~M6,  ~Mittelwert,
  "Ø",  "Gesamt",  1.17, 1.13, 1.84, 2.23, 1.50, 1.33, 1.53
)
judge_gpt41mini_full <- bind_rows(judge_gpt41mini, gesamt_row)

write.csv(judge_gpt41mini_full, file.path(OUTPUT_DIR, "tab_5_5_judge_gpt41mini.csv"), row.names = FALSE)
cat("  Tab 5.5: Judge-Scores GPT-4.1-mini gespeichert.\n")

# P10-Vergleich der drei Modelle
judge_p10_vergleich <- tribble(
  ~Metrik,              ~`GPT-4.1-mini`, ~`Claude Haiku 4.5`, ~`Claude Sonnet 4.6`,
  "M1 Socratic Purity",      0.90,             0.70,                0.89,
  "M2 Mission Adherence",    0.44,             1.30,                1.80,
  "M3 Persona Responsiveness",1.30,            2.80,                2.40,
  "M4 Question Depth",       1.50,             2.70,                2.60,
  "M5 Sequence Coherence",   0.78,             2.40,                1.80,
  "M6 Autonomy Preservation",1.00,             2.10,                2.20,
  "Ø M1–M6",                 0.99,             2.00,                1.95
)

write.csv(judge_p10_vergleich, file.path(OUTPUT_DIR, "tab_5_6_p10_modellvergleich.csv"), row.names = FALSE)

# Abb 5.7 — Heatmap Judge-Scores × Personas (GPT-4.1-mini)
judge_long <- judge_gpt41mini |>
  pivot_longer(cols = M1:M6, names_to = "Metrik", values_to = "Score") |>
  mutate(
    Persona = factor(Persona, levels = rev(paste0("P0", 1:9), "P10")),
    Flagging = Score <= 1
  )

p_heatmap <- ggplot(judge_long, aes(x = Metrik, y = Persona, fill = Score)) +
  geom_tile(color = "white", linewidth = 0.5) +
  geom_text(aes(label = sprintf("%.2f", Score), color = Score > 1.5), size = 3) +
  scale_fill_gradient2(
    low      = FARBE_WARN,
    mid      = "#FFF0C0",
    high     = FARBE_AKZ,
    midpoint = 1.5,
    limits   = c(0, 3),
    name     = "Score\n(0–3)"
  ) +
  scale_color_manual(values = c("TRUE" = "black", "FALSE" = "white"), guide = "none") +
  labs(
    title    = "Abbildung 5.7: LLM-Judge-Scores GPT-4.1-mini — Heatmap M1–M6 × Personas",
    subtitle = "Rot = unter Flagging-Schwelle (≤ 1.0) | Grün = gut (≥ 2.0)",
    x        = "Evaluationsmetrik",
    y        = "Persona"
  ) +
  thesis_theme +
  theme(legend.position = "right")

save_plot(p_heatmap, "abb_5_7_judge_heatmap.png", width = 8, height = 5)

# Abb 5.8 — Metriken-Profil (Balkendiagramm Ø-Scores)
metrik_summary <- judge_gpt41mini |>
  summarise(across(M1:M6, mean)) |>
  pivot_longer(everything(), names_to = "Metrik", values_to = "Mittelwert") |>
  mutate(
    Label    = c("M1\nSocratic Purity", "M2\nMission Adherence",
                 "M3\nPersona Resp.", "M4\nQuestion Depth",
                 "M5\nSeq. Coherence", "M6\nAutonomy Preserv."),
    Flagging = Mittelwert <= 1
  )

p_metriken <- ggplot(metrik_summary, aes(x = Metrik, y = Mittelwert, fill = Flagging)) +
  geom_col(width = 0.65, alpha = 0.9) +
  geom_hline(yintercept = 1, linetype = "dashed", color = FARBE_WARN, linewidth = 0.8) +
  geom_hline(yintercept = 2, linetype = "dotted", color = FARBE_AKZ, linewidth = 0.7) +
  geom_text(aes(label = sprintf("%.2f", Mittelwert)), vjust = -0.4, size = 3.5) +
  scale_fill_manual(
    values = c("TRUE" = FARBE_WARN, "FALSE" = FARBE_PRE),
    labels = c("TRUE" = "unter Flagging-Schwelle", "FALSE" = "über Schwelle"),
    name   = ""
  ) +
  scale_x_discrete(labels = metrik_summary$Label) +
  scale_y_continuous(limits = c(0, 3.2), breaks = 0:3) +
  labs(
    title    = "Abbildung 5.8: Durchschnittliche Judge-Scores je Metrik (GPT-4.1-mini, alle 10 Personas)",
    subtitle = "Gestrichelt = Flagging-Schwelle (1.0) | Gepunktet = guter Bereich (2.0)",
    x        = "Metrik",
    y        = "Ø Score (Skala 0–3)"
  ) +
  thesis_theme

save_plot(p_metriken, "abb_5_8_metriken_profil.png", width = 8, height = 5)

# Abb 5.9 — Radar-Chart P10 Modellvergleich
if (requireNamespace("fmsb", quietly = TRUE)) {
  radar_data <- tribble(
    ~M1,  ~M2,  ~M3,  ~M4,  ~M5,  ~M6,
    3,    3,    3,    3,    3,    3,   # Max
    0,    0,    0,    0,    0,    0,   # Min
    0.90, 0.44, 1.30, 1.50, 0.78, 1.00,  # GPT-4.1-mini
    0.70, 1.30, 2.80, 2.70, 2.40, 2.10,  # Claude Haiku 4.5
    0.89, 1.80, 2.40, 2.60, 1.80, 2.20   # Claude Sonnet 4.6
  )

  png(file.path(OUTPUT_DIR, "abb_5_9_p10_radar.png"), width = 800, height = 600, res = 120)
  par(mar = c(1, 1, 2, 1))
  fmsb::radarchart(
    radar_data,
    axistype    = 1,
    pcol        = c(FARBE_WARN, FARBE_PRE, FARBE_AKZ),
    pfcol       = adjustcolor(c(FARBE_WARN, FARBE_PRE, FARBE_AKZ), alpha.f = 0.15),
    plwd        = 2,
    cglcol      = "grey80",
    cglty       = 1,
    axislabcol  = "grey40",
    vlcex       = 0.85,
    title       = "Abb. 5.9: P10-Modellvergleich M1–M6 (Radar-Chart)\nGPT-4.1-mini | Claude Haiku 4.5 | Claude Sonnet 4.6"
  )
  legend("topright", legend = c("GPT-4.1-mini", "Claude Haiku 4.5", "Claude Sonnet 4.6"),
         col = c(FARBE_WARN, FARBE_PRE, FARBE_AKZ), lwd = 2, cex = 0.85)
  dev.off()
  message("  → gespeichert: abb_5_9_p10_radar.png")
}

# Kappa-Tabelle (bekannte Werte aus Goldset-Validierung)
kappa_tab <- tribble(
  ~Metrik, ~Bezeichnung,                ~Kappa_Lauf1, ~Kappa_Lauf2, ~Status,
  "M1",   "Socratic Purity",            0.722,        0.722,        "✅ bestanden",
  "M2",   "Mission Adherence",          0.722,        0.722,        "✅ bestanden",
  "M3",   "Persona Responsiveness",     0.474,        1.000,        "✅ bestanden (nach Revision)",
  "M4",   "Question Depth",             0.737,        0.737,        "✅ bestanden",
  "M5",   "Sequence Coherence",         0.474,        0.706,        "✅ bestanden (nach Revision)",
  "M6",   "Autonomy Preservation",      0.737,        0.737,        "✅ bestanden",
  "M7",   "Crisis Detection",           1.000,        1.000,        "✅ bestanden"
)
write.csv(kappa_tab, file.path(OUTPUT_DIR, "tab_5_7_kappa_validierung.csv"), row.names = FALSE)
cat("  Tab 5.7: Kappa-Tabelle gespeichert.\n")

# ---------------------------------------------------------------------------
# 7. ADAPTIONSSIGNALE UND PROZESSDATEN
# ---------------------------------------------------------------------------
cat("\n=== 7. PROZESSDATEN ===\n")

if (!is.null(df_signal)) {
  signal_summary <- df_signal |>
    group_by(lazarus_signal) |>
    summarise(n = sum(n_nachrichten), .groups = "drop") |>
    mutate(
      anteil   = round(n / sum(n) * 100, 1),
      lazarus_signal = factor(lazarus_signal,
        levels = c("ressourcen", "herausforderung", "bedrohung", "verlust", "irrelevant", "unklar"))
    )

  # Abb 5.10 — Lazarus-Signale
  p_signal <- ggplot(signal_summary, aes(x = reorder(lazarus_signal, n), y = n, fill = lazarus_signal)) +
    geom_col(width = 0.7) +
    geom_text(aes(label = paste0(n, " (", anteil, "%)")), hjust = -0.1, size = 3.2) +
    coord_flip() +
    scale_fill_manual(values = c(
      "ressourcen"       = FARBE_AKZ,
      "herausforderung"  = "#4C72B0",
      "bedrohung"        = FARBE_WARN,
      "verlust"          = "#C44E52",
      "irrelevant"       = FARBE_GRAU,
      "unklar"           = "#CCCCCC"
    )) +
    labs(
      title    = "Abbildung 5.10: Verteilung der Lazarus-Adaptionssignale",
      subtitle = "Häufigkeit der vom System erkannten Bewertungsmuster (alle Sessions)",
      x        = "Lazarus-Signal",
      y        = "Anzahl KAIA-Antworten"
    ) +
    guides(fill = "none") +
    thesis_theme

  save_plot(p_signal, "abb_5_10_adaptionssignale.png", width = 7, height = 4)
}

# Fragetyp-Verteilung
if (!is.null(df_fragetyp)) {
  fragetyp_summary <- df_fragetyp |>
    group_by(fragetyp) |>
    summarise(n = sum(n), .groups = "drop") |>
    filter(!is.na(fragetyp) & fragetyp != "") |>
    arrange(desc(n))

  p_fragetyp <- ggplot(fragetyp_summary, aes(x = reorder(fragetyp, n), y = n)) +
    geom_col(fill = FARBE_PRE, width = 0.7, alpha = 0.85) +
    geom_text(aes(label = n), hjust = -0.2, size = 3.2) +
    coord_flip() +
    labs(
      title    = "Abbildung 5.11: Verteilung der eingesetzten Fragetypen",
      subtitle = "Häufigkeit je sokratischem Fragetyp (alle Sessions, alle Teilnehmenden)",
      x        = "Fragetyp",
      y        = "Anzahl"
    ) +
    thesis_theme

  save_plot(p_fragetyp, "abb_5_11_fragetypen.png", width = 7, height = 5)
}

# ---------------------------------------------------------------------------
# 8. KOSTEN-ÜBERSICHT
# ---------------------------------------------------------------------------
cat("\n=== 8. KOSTEN ===\n")

if (!is.null(df_kosten)) {
  write.csv(df_kosten, file.path(OUTPUT_DIR, "tab_5_8_llm_kosten.csv"), row.names = FALSE)

  p_kosten <- ggplot(df_kosten |> filter(gesamt_eur > 0),
                     aes(x = reorder(model, gesamt_eur), y = gesamt_eur, fill = provider)) +
    geom_col(width = 0.7) +
    geom_text(aes(label = paste0("€", sprintf("%.4f", gesamt_eur))), hjust = -0.1, size = 3) +
    coord_flip() +
    labs(
      title    = "Abbildung 5.12: LLM-Kosten nach Modell (Studiengesamtlaufzeit)",
      subtitle = "Nur Produktionsnutzung (ohne Eval-Runs)",
      x        = "Modell",
      y        = "Kosten (EUR)",
      fill     = "Anbieter"
    ) +
    scale_fill_manual(values = c(
      "anthropic" = FARBE_AKZ,
      "openai"    = FARBE_PRE,
      "mistral"   = FARBE_GRAU
    )) +
    thesis_theme

  save_plot(p_kosten, "abb_5_12_kosten.png", width = 7, height = 4)
}

# ---------------------------------------------------------------------------
# 9. ÜBERSICHT ALLER OUTPUTS
# ---------------------------------------------------------------------------
cat("\n=== OUTPUTS ===\n")
outputs <- list.files(OUTPUT_DIR, full.names = FALSE)
cat(paste0("  ", seq_along(outputs), ". ", outputs, "\n"), sep = "")

cat("\n=== KAIA Auswertung abgeschlossen. ===\n")
cat("Plots und Tabellen in:", OUTPUT_DIR, "\n")
cat("Nächster Schritt: Werte aus output/ in Kap5 eintragen.\n")
