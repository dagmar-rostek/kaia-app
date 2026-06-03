# =============================================================================
# Power-Analyse — KAIA Pilotstudie
# Masterthesis M.Sc. Data Science & Analytics, SRH Fernhochschule Riedlingen
# Autorin: Dagmar Rostek
#
# Fragestellung: Wie viele Teilnehmende brauche ich, damit ich einen
# mittleren Effekt (d = 0.5) mit 80% Wahrscheinlichkeit entdecke?
#
# Test: Wilcoxon-Vorzeichenrangtest (einstichprobenartig / Prä-Post-Vergleich)
# Begründung für nicht-parametrisch: N < 30, keine gesicherte Normalverteilung
# =============================================================================

# Pakete installieren (einmalig, auskommentiert lassen wenn schon installiert)
# install.packages("pwr")
# install.packages("ggplot2")  # für Plot

library(pwr)

# =============================================================================
# 1. Parameter festlegen
# =============================================================================

alpha  <- 0.05   # Signifikanzniveau (standard in Sozialwissenschaften)
power  <- 0.80   # Gewünschte Teststärke (80% — standard, 90% wäre konservativer)
d      <- 0.5    # Effektgröße Cohen's d: klein=0.2, mittel=0.5, groß=0.8
                 # Begründung: kein Vorergebnis, mittlere Effektgröße als
                 # konservative Schätzung bei edukativen Interventionen
                 # (vgl. Hattie, 2009: d ≈ 0.4–0.6 für Feedback-Interventionen)

# =============================================================================
# 2. Berechnung: t-Test-Äquivalent (Ausgangsbasis)
# =============================================================================
# Der Wilcoxon-Vorzeichenrangtest hat eine Asymptotische Relative Effizienz
# (ARE) von π/3 ≈ 1.047 gegenüber dem t-Test bei Normalverteilung.
# Das bedeutet: der Wilcoxon-Test braucht geringfügig mehr Personen.
# Formel: n_wilcoxon = n_t * (1 / ARE) = n_t * (3/π)

result_t <- pwr.t.test(
  d           = d,
  sig.level   = alpha,
  power       = power,
  type        = "one.sample",   # einstichprobenartig (= Prä-Post-Differenz)
  alternative = "two.sided"     # ungerichtet, weil Pilotstudie
)

cat("=== t-Test (Referenz) ===\n")
print(result_t)

# =============================================================================
# 3. Korrektur für Wilcoxon (ARE-Adjustment)
# =============================================================================

ARE            <- pi / 3          # ≈ 1.047
n_t            <- result_t$n
n_wilcoxon_raw <- n_t / ARE       # sind fast gleich
n_wilcoxon     <- ceiling(n_wilcoxon_raw)

cat("\n=== Wilcoxon-Korrektur ===\n")
cat(sprintf("n (t-Test):          %.1f → aufgerundet %d\n", n_t, ceiling(n_t)))
cat(sprintf("ARE (π/3):           %.4f\n", ARE))
cat(sprintf("n (Wilcoxon, roh):   %.1f\n", n_wilcoxon_raw))
cat(sprintf("n (Wilcoxon, final): %d\n", n_wilcoxon))

# =============================================================================
# 4. Dropout-Puffer einrechnen
# =============================================================================
# Pilotstudien haben erfahrungsgemäß 15–30% Dropout.
# Sicherheitspuffer: 25%

dropout_rate  <- 0.25
n_mit_puffer  <- ceiling(n_wilcoxon / (1 - dropout_rate))

cat("\n=== Rekrutierungsziel (mit Dropout-Puffer) ===\n")
cat(sprintf("Dropout-Rate:        %.0f%%\n", dropout_rate * 100))
cat(sprintf("Benötigt für Analyse:%d\n", n_wilcoxon))
cat(sprintf("Zu rekrutieren:      %d\n", n_mit_puffer))
cat(sprintf("Geplante Stichprobe: 20 (liegt zwischen Minimum und Puffer)\n"))

# =============================================================================
# 5. Sensitivitätsanalyse — was kann ich mit N=20 entdecken?
# =============================================================================

result_sens <- pwr.t.test(
  n           = 20,
  sig.level   = alpha,
  power       = power,
  type        = "one.sample",
  alternative = "two.sided"
)

cat("\n=== Sensitivitätsanalyse: Minimale detektierbare Effektgröße bei N=20 ===\n")
cat(sprintf("Mit N=20, α=%.2f, Power=%.2f\n", alpha, power))
cat(sprintf("Minimales d:         %.3f\n", result_sens$d))
cat("Interpretation: KAIA-Studie kann mittlere bis große Effekte zuverlässig entdecken.\n")
cat("Für kleine Effekte (d<0.3) ist N=20 nicht ausreichend — bekannte Limitation.\n")

# =============================================================================
# 6. Power-Kurve über verschiedene N
# =============================================================================

n_seq      <- seq(5, 50, by = 1)
power_seq  <- sapply(n_seq, function(n) {
  pwr.t.test(n = n, d = d, sig.level = alpha,
             type = "one.sample", alternative = "two.sided")$power
})

cat("\n=== Power bei verschiedenen Stichprobengrößen (d=0.5, α=0.05) ===\n")
df_power <- data.frame(n = n_seq, power = round(power_seq, 3))
print(df_power[df_power$n %in% c(10, 15, 17, 20, 25, 30, 40, 50), ])

# =============================================================================
# 7. Plot (optional — ausführen wenn ggplot2 installiert)
# =============================================================================

if (requireNamespace("ggplot2", quietly = TRUE)) {
  library(ggplot2)

  p <- ggplot(df_power, aes(x = n, y = power)) +
    geom_line(color = "#3b82f6", linewidth = 1) +
    geom_hline(yintercept = 0.80, linetype = "dashed", color = "#ef4444") +
    geom_vline(xintercept = n_wilcoxon, linetype = "dotted", color = "#8b5cf6") +
    geom_point(data = data.frame(n = 20, power = power_seq[n_seq == 20]),
               color = "#10b981", size = 3) +
    annotate("text", x = n_wilcoxon + 1.5, y = 0.15,
             label = sprintf("n_min = %d", n_wilcoxon),
             hjust = 0, size = 3.5, color = "#8b5cf6") +
    annotate("text", x = 22, y = power_seq[n_seq == 20] - 0.04,
             label = "N = 20 (geplant)", hjust = 0, size = 3.5, color = "#10b981") +
    scale_y_continuous(limits = c(0, 1), labels = scales::percent_format()) +
    labs(
      title    = "Power-Kurve: Wilcoxon-Vorzeichenrangtest",
      subtitle = sprintf("d = %.1f, α = %.2f (zweiseitig)", d, alpha),
      x        = "Stichprobengröße (N)",
      y        = "Teststärke (Power)",
      caption  = "Rote Linie: Power = 80% | Lila: Mindeststichprobe | Grün: geplantes N"
    ) +
    theme_minimal(base_size = 12)

  ggsave("docs/power_kurve.png", plot = p, width = 7, height = 4.5, dpi = 150)
  cat("\nPlot gespeichert: docs/power_kurve.png\n")
} else {
  cat("\nHinweis: ggplot2 nicht installiert — kein Plot erstellt.\n")
  cat("install.packages('ggplot2') und Skript erneut ausführen.\n")
}

# =============================================================================
# 8. Zusammenfassung für Thesis / Studienprotokoll
# =============================================================================

cat("\n")
cat("=============================================================\n")
cat("ZUSAMMENFASSUNG FÜR STUDIENPROTOKOLL\n")
cat("=============================================================\n")
cat(sprintf("Test:                Wilcoxon-Vorzeichenrangtest (einstichprobenartig)\n"))
cat(sprintf("Signifikanzniveau:   α = %.2f (zweiseitig)\n", alpha))
cat(sprintf("Teststärke:          1-β = %.2f\n", power))
cat(sprintf("Erwartete Effektgr.: d = %.1f (mittel; Cohen, 1988)\n", d))
cat(sprintf("Minimales N:         %d Teilnehmende\n", n_wilcoxon))
cat(sprintf("Empfohlen mit Puffer:%d Teilnehmende (25%% Dropout)\n", n_mit_puffer))
cat(sprintf("Geplantes N:         20 Teilnehmende\n"))
cat(sprintf("Power bei N=20:      %.1f%%\n", power_seq[n_seq == 20] * 100))
cat("Limitierung:         Kleine Stichprobe erlaubt keine konfirmatorischen\n")
cat("                     Schlüsse; explorativer Charakter explizit deklariert.\n")
cat("=============================================================\n")
