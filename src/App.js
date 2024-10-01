import { Component } from "react";
import { Link } from "react-router-dom";
import { CiLocationOn } from "react-icons/ci";
import { CgSandClock } from "react-icons/cg";
import { GiCash } from "react-icons/gi";
import { IoPerson } from "react-icons/io5";
import { FaBookmark } from "react-icons/fa6";
import { GrUserWorker } from "react-icons/gr";
import "./App.css";

const apiConstantStatus = {
  initial: "INITIAL",
  success: "SUCCESS",
  inProgress: "IN_PROGRESS",
  failure: "FAILURE",
};

class App extends Component {
  state = {
    apiStatus: apiConstantStatus.initial,
    jobsList: [],
    bookmarkedList: [], // State for bookmarked jobs
    currentPage: 1,
    loading: false,
    jobsTab: true, // Track if Jobs tab is active
  };

  componentDidMount() {
    this.getJobs();
    window.addEventListener("scroll", this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  getJobs = async () => {
    const { currentPage, jobsList } = this.state;

    this.setState({ loading: true });

    const url = `https://testapi.getlokalapp.com/common/jobs?page=${currentPage}`;

    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const updatedData = data.results.map((each) => ({
        id: each.id,
        companyName: each.company_name,
        description: each.title,
        jobType: each.job_hours,
        jobRole: each.job_category,
        location: each.job_location_slug,
        salaryMin: each.salary_min,
        salaryMax: each.salary_max,
        experience: each.experience,
        qualification: each.job_hours,
        totalVacancy: each.openings_count,
        bookMark: each.is_bookmarked,
        isApplied: each.is_applied,
        expires: each.expire_on,
        totalApplied: each.num_applications,
        views: each.views,
      }));

      this.setState({
        apiStatus: apiConstantStatus.success,
        jobsList: [...jobsList, ...updatedData],
        loading: false,
      });
    } else {
      this.setState({ apiStatus: apiConstantStatus.failure, loading: false });
    }
  };

  handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100 &&
      !this.state.loading
    ) {
      this.loadNextPage();
    }
  };

  loadNextPage = () => {
    this.setState(
      (prevState) => ({
        currentPage: prevState.currentPage + 1,
      }),
      () => {
        this.getJobs();
      }
    );
  };

  toggleBookmark = (job) => {
    const { bookmarkedList } = this.state;
    const isBookmarked = bookmarkedList.some(
      (bookmarkedJob) => bookmarkedJob.id === job.id
    );

    if (isBookmarked) {
      // Remove from bookmarks
      const updatedBookmarks = bookmarkedList.filter(
        (bookmarkedJob) => bookmarkedJob.id !== job.id
      );
      this.setState({ bookmarkedList: updatedBookmarks });
    } else {
      // Add to bookmarks
      this.setState({ bookmarkedList: [...bookmarkedList, job] });
    }
  };

  renderJobsList = () => {
    const { jobsList, bookmarkedList, jobsTab } = this.state;
    const jobsToDisplay = jobsTab ? jobsList : bookmarkedList;

    if (!jobsTab && bookmarkedList.length === 0) {
      return <p>No bookmarks added yet</p>;
    }

    return (
      <ul className="each-jobs">
        {jobsToDisplay.map((eachJob) => {
          const isBookmarked = bookmarkedList.some(
            (bookmarkedJob) => bookmarkedJob.id === eachJob.id
          );
          return (
            <li key={eachJob.id} className="each-job">
              <Link to={`/jobs/${eachJob.id}`} className="link">
                <div>
                  <h1 className="company-name">{eachJob.companyName}</h1>
                  <h2 className="job-role">{eachJob.jobRole}</h2>
                  <div className="container">
                    <div className="box">
                      <h4>
                        <CiLocationOn />
                        Location
                      </h4>
                      <p>{eachJob.location}</p>
                    </div>
                    <div className="box">
                      <h4>
                        <GiCash /> Salary
                      </h4>
                      <p>
                        {eachJob.salaryMin} - {eachJob.salaryMax}
                      </p>
                    </div>
                    <div className="box">
                      <h4>
                        <IoPerson />
                        Openings
                      </h4>
                      <p>{eachJob.totalVacancy}</p>
                    </div>
                    <div className="box">
                      <h4>
                        <CgSandClock />
                        Application Ends
                      </h4>
                      <p>
                        {new Date(eachJob.expires).toLocaleString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "2-digit",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
              <button
                onClick={() => this.toggleBookmark(eachJob)}
                className={`bookmark-button ${
                  isBookmarked ? "bookmarked" : ""
                }`}
              >
                <FaBookmark />
                {isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
              </button>
            </li>
          );
        })}
      </ul>
    );
  };

  toggleTab = () => {
    this.setState((prevState) => ({ jobsTab: !prevState.jobsTab }));
  };

  render() {
    const { jobsTab } = this.state;
    const jobsButtonClass = jobsTab ? "selected" : "";
    const bookmarksButtonClass = !jobsTab ? "selected" : "";

    return (
      <div className="home">
        <h1>{jobsTab ? "Jobs" : "Bookmarks"}</h1>
        {this.renderJobsList()}

        <footer className="footer">
          <button
            className={jobsButtonClass}
            onClick={this.toggleTab}
            type="button"
          >
            <GrUserWorker />
            Jobs
          </button>
          <button
            className={bookmarksButtonClass}
            onClick={this.toggleTab}
            type="button"
          >
            <FaBookmark />
            Bookmarks
          </button>
        </footer>
      </div>
    );
  }
}

export default App;
