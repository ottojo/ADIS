#!/usr/bin/env Rscript

library("tidyverse")
library("scales")

args <- commandArgs(trailingOnly = TRUE)

data = tibble(
  type = character(),
  scenario = character(),
  count = numeric(),
  rps = numeric()
)

# Ugly solution
files = read_csv(file("stdin"), col_types = "ccdc")
for (i in seq(1, nrow(files))) {
  k6data <- read_csv(files[i,4], col_types = "cddccdlccccccicccc")
  k6data <- k6data[k6data$metric_name=="http_reqs" & !is.na(k6data$scenario) & k6data$scenario=="test",]
  rate <- sum(k6data$metric_value) / (max(k6data$timestamp) - min(k6data$timestamp))
  
  data <- data %>% add_row(files[i,1], files[i,2], files[i,3], rps = rate)
}

plt <- ggplot(data, aes(y = factor(count), x = rps, fill = type)) + 
  geom_col(position = position_dodge(width = 0.9), width = 0.7) +
  xlab("RPS") +
  ylab("Connection Count") +
  ggtitle("Request Rate") +
  facet_wrap(~scenario, labeller = label_both, scales = "free") +
  theme(legend.position = "bottom", legend.title = element_blank(), plot.title = element_text(hjust = 0.5))

ggsave("/dev/stdout", plt, "svg", width = 10, height = 10 / sqrt(2))