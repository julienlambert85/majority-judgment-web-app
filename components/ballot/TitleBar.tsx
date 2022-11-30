import {useRouter} from 'next/router';
import Button from '@components/Button';
import {useTranslation} from 'next-i18next';
import {getElection, castBallot, apiErrors, ElectionPayload, CandidatePayload, GradePayload} from '@services/api';
import {getLocaleShort} from '@services/utils';
import {faCalendarDays} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';


interface TitleBarInterface {
  election: ElectionPayload;
}
const TitleBar = ({election}: TitleBarInterface) => {
  const {t} = useTranslation();
  const router = useRouter();
  const locale = getLocaleShort(router);

  const dateEnd = new Date(election.date_end);
  const farAway = new Date();
  farAway.setFullYear(farAway.getFullYear() + 1);
  const isFarAway = +dateEnd > +farAway;

  if (!isFarAway) {
    return (
      <div className="w-100 bg-light p-2 text-black justify-content-center d-flex ">
        <div className="me-2">
          <FontAwesomeIcon icon={faCalendarDays} />
        </div>
        <div>
          {` ${t("vote.open-until")}   ${new Date(election.date_end).toLocaleDateString(locale, {dateStyle: "long"})}`}
        </div>
      </div>
    )
  } else {
    return null;
  }
};

export default TitleBar
