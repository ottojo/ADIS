#!/usr/bin/env Rscript

library("tidyverse")
library("scales")

args <- commandArgs(trailingOnly = TRUE)

data = tibble(
  type = character(),
  rate = numeric(),
  perc = numeric(),
  lat = numeric()
)

# Ugly solution
files = read_csv(file("stdin"), col_types = "cdc")
for (i in seq(1, nrow(files))) {
  k6data <- read_csv(files[i,3], col_types = "cddccdlccccccicccc")
  k6data <- k6data[k6data$metric_name=="http_req_duration" & !is.na(k6data$scenario) & k6data$scenario=="test",]
  k6data <- k6data$metric_value
  perc <- c(seq(0,0.99,0.01), 0.999, 0.9999)
  
  frame <- tibble(
    files[i,1],
    files[i,2],
    perc = perc,
    lat = quantile(k6data, probs = perc)
  )
  
  data <- rbind(data, frame)
}

perc_probs <- c(0.5, 0.9, 0.99, 0.999)
perc_trans <- trans_new("perc-trans", 
                        function(x) log10(1/(1-x)), 
                        function(x) (10^x-1)/(10^x), 
                        domain=c(0,1))

plt <- ggplot(data, aes(x = perc)) + 
  geom_line(aes(y = lat, colour = factor(rate))) +
  scale_x_continuous(trans=perc_trans, breaks = perc_probs, labels = scales::label_percent()) +
  xlab("Percentile") +
  ylab("Response Time [ms]") +
  ggtitle(if (length(args) >= 1) args[1] else "Latency Percentiles") +
  scale_color_discrete(name = "Rate") +
  theme(legend.position = "bottom", plot.title = element_text(hjust = 0.5)) +
  facet_wrap(~type, labeller = label_both, scales = "free")

ggsave("/dev/stdout", plt, "svg", width = 10, height = 10 / sqrt(2))