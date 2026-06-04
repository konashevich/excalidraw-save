import Trans from "./Trans";

const BRAVE_SHIELDS_HELP_URL =
  "https://support.brave.com/hc/en-us/articles/360022806212-How-do-I-change-my-Shields-settings";

const githubIssuesUrl =
  import.meta.env.VITE_APP_GITHUB_REPO?.trim() ||
  "https://github.com/konashevich/diagrams-free";

const BraveMeasureTextError = () => {
  return (
    <div data-testid="brave-measure-text-error">
      <p>
        <Trans
          i18nKey="errors.brave_measure_text_error.line1"
          bold={(el) => <span style={{ fontWeight: 600 }}>{el}</span>}
        />
      </p>
      <p>
        <Trans
          i18nKey="errors.brave_measure_text_error.line2"
          bold={(el) => <span style={{ fontWeight: 600 }}>{el}</span>}
        />
      </p>
      <p>
        <Trans
          i18nKey="errors.brave_measure_text_error.line3"
          link={(el) => (
            <a
              href={BRAVE_SHIELDS_HELP_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {el}
            </a>
          )}
        />
      </p>
      <p>
        <Trans
          i18nKey="errors.brave_measure_text_error.line4"
          issueLink={(el) => (
            <a
              href={`${githubIssuesUrl}/issues`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {el}
            </a>
          )}
          supportLink={(el) => (
            <a href="mailto:support@diagrams.free">{el}</a>
          )}
          discordLink={(el) => (
            <a href="mailto:support@diagrams.free">{el}</a>
          )}
        />
      </p>
    </div>
  );
};

export default BraveMeasureTextError;
